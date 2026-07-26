import boto3
import json
import os
import urllib.parse
import urllib.request

from datetime import datetime, timezone

# Refreshes the GitHub contribution heatmap data consumed by the website.
# Merges the public contribution graphs of the configured accounts into a
# single dataset and publishes it to the production S3 bucket, where the
# existing S3 -> SQS -> cloudfrontInvalidation pipeline refreshes the CDN.
#
# No GitHub token required: the contribution graphs are public. Private
# commit counts are included automatically for any account that has enabled
# "Settings -> Contributions -> Include private contributions on my profile".
#
# On any fetch error the function raises without writing, so the last
# successfully published object stays in place.

prodBucket = os.environ.get('prod_bucket')
objectKey = os.environ.get('object_key', 'data/contributions.json')
accounts = [a.strip() for a in os.environ.get('accounts', '').split(',') if a.strip()]

# Public, no-auth contributions API. It scrapes the public profile graph, so it
# reflects the same totals GitHub shows there — including private-with-toggle.
api_url = 'https://github-contributions-api.jogruber.de/v4/{user}?y=last'


def level_for(count):
    # Bucket a merged daily count into GitHub's 0-4 intensity scale.
    if count == 0:
        return 0
    if count <= 2:
        return 1
    if count <= 5:
        return 2
    if count <= 9:
        return 3
    return 4


def fetch_user(user):
    request = urllib.request.Request(
        api_url.format(user=urllib.parse.quote(user)),
        headers={'Accept': 'application/json', 'User-Agent': 'CloudResume-updateContributions'}
    )
    with urllib.request.urlopen(request, timeout=15) as response:
        if response.status != 200:
            raise ValueError(f"{user}: HTTP {response.status}")
        return json.load(response).get('contributions', [])


def lambda_handler(event, context):
    if not prodBucket:
        raise ValueError("Environment variable 'prod_bucket' is not set.")
    if not accounts:
        raise ValueError("Environment variable 'accounts' is not set.")

    # Merge by date — sum the counts from every account for each day.
    by_date = {}
    for user in accounts:
        for day in fetch_user(user):
            date = day.get('date')
            if date:
                by_date[date] = by_date.get(date, 0) + (day.get('count') or 0)

    days = [
        {'date': date, 'count': count, 'level': level_for(count)}
        for date, count in sorted(by_date.items())
    ]
    total = sum(day['count'] for day in days)

    payload = {
        'total': total,
        'accounts': accounts,
        'updated': datetime.now(timezone.utc).isoformat(),
        'days': days
    }

    client = boto3.client('s3')
    client.put_object(
        Bucket=prodBucket,
        Key=objectKey,
        Body=json.dumps(payload, indent=2).encode('utf-8'),
        ContentType='application/json',
        CacheControl='public, max-age=300'
    )

    print(f"Published {objectKey} — {total} contributions over {len(days)} days ({' + '.join(accounts)})")
    return {'total': total, 'days': len(days), 'accounts': accounts}
