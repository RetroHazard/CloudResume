// website/src/components/ErrorBoundary.jsx
import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        console.error('Render error caught by ErrorBoundary:', error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className='content-block'>
                    <p className='text-content-accent'>Something went wrong loading this page.</p>
                    <a href='/'>Return to home</a>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
