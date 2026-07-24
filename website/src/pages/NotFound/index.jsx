import { Link } from 'react-router-dom';

function NotFound() {
    return (
        <div className='content-block' id='not-found'>
            <title>404 – Page Not Found | Cloud Resume</title>
            <h1 className='h1 mb-0 font-extrabold text-content-header'>Page Not Found</h1>
            <p className='text-content-accent'>The page you're looking for doesn't exist.</p>
            <Link to='/'>Return to home</Link>
        </div>
    );
}

export default NotFound;
