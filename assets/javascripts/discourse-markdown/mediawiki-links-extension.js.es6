export function setup(helper) {
    if (!helper.markdownIt) {
        return;
    }

    let base_url;

    helper.registerOptions((opts, siteSettings) => {
        opts.features['mediawiki_links'] = !!siteSettings.mediawiki_links_enabled;
        base_url = siteSettings.mediawiki_links_base_url;
    });

    helper.registerPlugin(md => {
        if (!base_url) {
            return;
        }
        md.core.textPostProcess.ruler.push('mediawiki_links', {
            matcher: /\[\[([^|\]]*)(?:\|([^\]]*))?\]\]/,
            onMatch: function(buffer, matches, state) {
                console.log(matches);
                console.log(state);
                let page_name = matches[1];
                let link_text = matches[2] ?? matches[1];

                let a_open = new state.Token('a_open', 'a', 1);
                a_open.attrSet('href', base_url + encodeURI(page_name.replaceAll(' ', '_')));
                console.log(a_open);
                buffer.push(a_open);

                if (link_text == "") {
                    // Pipe trick; remove category name
                    link_text = page_name.slice(page_name.indexOf(':') + 1);
                }
                let token = new state.Token('text', '', 0);
                token.content = link_text;
                buffer.push(token);

                let a_close = new state.Token('a_close', 'a', -1);
                buffer.push(a_close);
            }
        });
    });
}
