export async function initWebXrPolyfill() {
    await new Promise<void>((resolve, reject) => {
        try {
            if ((navigator as any).xr) {
                return resolve();
            }
            if ((window as any).WebXRPolyfill) {
                // tslint:disable-next-line:no-unused-expression
                new (window as any).WebXRPolyfill();
                return resolve();
            } else {
                const url =
                    'https://cdn.jsdelivr.net/npm/webxr-polyfill@latest/build/webxr-polyfill.js';
                const scriptElement = document.createElement('script');
                scriptElement.src = url;
                document.head.appendChild(scriptElement);
                scriptElement.onload = () => {
                    // tslint:disable-next-line:no-unused-expression
                    new (window as any).WebXRPolyfill();
                    resolve();
                };
            }
        } catch (error) {
            reject(error);
        }
    });
}
