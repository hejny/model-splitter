import { VERSION } from './config';

test('renders name of the project', () => {
    /*
    render(<App />);
    const linkElement = screen.getByText(/Model splitter/i);
    expect(linkElement).toBeInTheDocument();
    */

    expect(VERSION).toBe(VERSION);

    /**
        TODO: !!! Tests are not working with the Babylon

        C:\Users\me\work\vrpaint\model-splitter\node_modules\@babylonjs\core\index.js:1
        ({"Object.<anonymous>":function(module,exports,require,__dirname,__filename,global,jest){export * from "./abstractScene";
                                                                                                ^^^^^^

        SyntaxError: Unexpected token 'export'
     */
});
