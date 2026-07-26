/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_DATA_SET: 'development' | 'production';
    readonly VITE_AWS_API_ENDPOINT: string;
    readonly VITE_RECAPTCHA_SITE_KEY?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

// Allow the <iconify-icon> custom element in JSX
declare namespace JSX {
    interface IntrinsicElements {
        'iconify-icon': React.DetailedHTMLProps<
            React.HTMLAttributes<HTMLElement> & {
                icon: string;
                width?: string | number;
                height?: string | number;
            },
            HTMLElement
        >;
    }
}
