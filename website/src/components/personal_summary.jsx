function PersonalSummary() {
    if (import.meta.env.VITE_DATA_SET === 'development') {
        return (
            <>
                <p className='mb-0 leading-relaxed max-sm:text-xs sm:text-sm'>
                    Lorem ipsum dolor sit amet, consectetur <strong>adipiscing elit</strong>. In sodales ac dui at{' '}
                    <em>vestibulum</em>. In condimentum metus id dui tincidunt, in blandit mi <em>vehicula</em>. Nulla
                    lacinia, erat sit amet elementum vulputate, lectus mauris volutpat mi, vitae accumsan metus elit ut
                    nunc. Vestibulum lacinia enim eget eros fermentum scelerisque. Proin augue leo, posuere ut imperdiet
                    vitae, fermentum eu ipsum. Sed sed neque sagittis, posuere urna nec, commodo leo. Pellentesque
                    posuere justo vitae massa volutpat maximus.
                </p>
            </>
        );
    } else {
        if (import.meta.env.VITE_DATA_SET !== 'production') {
            console.warn(
                `PersonalSummary: unknown VITE_DATA_SET value "${import.meta.env.VITE_DATA_SET}", falling back to production content`,
            );
        }
        return (
            <>
                <p className='mb-0 leading-relaxed max-sm:text-xs sm:text-sm'>
                    IAM and cloud-security engineer with <strong>15 years in technology</strong>, from frontline support
                    through systems, networks, and cloud infrastructure into a specialisation in identity, access, and
                    security. Hands-on with <strong>Okta, Terraform, AWS, and Kubernetes</strong>, and with{' '}
                    <strong>identity federation (SAML, OAuth 2.0, OIDC, SCIM)</strong>, PKI, MDM/endpoint security,
                    vulnerability management, and <em>AI governance</em>.
                </p>
                <p className='mb-0 leading-relaxed max-sm:text-xs sm:text-sm'>
                    Known for automating manual security operations (<strong>Python, Go, Bash</strong>) and building
                    internal tools that reduce risk and operational overhead. Proven ability to lead cross-functional
                    initiatives from design through <em>fleet-wide rollout</em>, balancing technical depth with clear
                    business impact.
                </p>
                <p className='mb-0 leading-relaxed max-sm:text-xs sm:text-sm'>
                    A committed continual learner outside the day-to-day — currently porting a macOS screenshot and
                    automation tool to native <strong>Swift</strong>, and maintaining a{' '}
                    <strong>Japan immigration statistics dashboard</strong> used by 2,000+ people in its first 30 days.
                </p>
            </>
        );
    }
}

export default PersonalSummary;
