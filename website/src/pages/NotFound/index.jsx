// website/src/pages/NotFound/index.jsx
function NotFound() {
    return (
        <div className='content-block' id='not-found'>
            <h1 className='h1 mb-0 font-extrabold text-content-header'>Page Not Found</h1>
            <p className='text-content-accent'>The page you're looking for doesn't exist.</p>
            <a href='/'>Return to home</a>
        </div>
    );
}

export default NotFound;
