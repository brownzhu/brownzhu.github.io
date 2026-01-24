const content_dir = 'contents/'
const config_file = 'config.yml'
const config_file_zh = 'config-zh.yml'
const section_names = ['home', 'awards', 'experience', 'publications'];

// Get current language from localStorage or URL
function getCurrentLanguage() {
    const urlParams = new URLSearchParams(window.location.search);
    const lang = urlParams.get('lang') || localStorage.getItem('language') || 'en';
    return lang;
}

// Set language
function setLanguage(lang) {
    localStorage.setItem('language', lang);
    loadContent(lang);
}

// Load content based on language
function loadContent(lang) {
    const config = lang === 'zh' ? config_file_zh : config_file;
    const suffix = lang === 'zh' ? '-zh' : '';
    
    // Load config
    fetch(content_dir + config)
        .then(response => response.text())
        .then(text => {
            const yml = jsyaml.load(text);
            Object.keys(yml).forEach(key => {
                try {
                    document.getElementById(key).innerHTML = yml[key];
                } catch {
                    console.log("Unknown id and value: " + key + "," + yml[key].toString())
                }
            })
            
            // Bind click events for language toggle
            const toggleLanguage = () => {
                const currentLang = getCurrentLanguage();
                const newLang = currentLang === 'en' ? 'zh' : 'en';
                setLanguage(newLang);
            };
            
            const englishNameElements = document.querySelectorAll('.english-name');
            const chineseNameElements = document.querySelectorAll('.chinese-name');
            
            englishNameElements.forEach(elem => {
                elem.addEventListener('click', (e) => {
                    e.stopPropagation();
                    toggleLanguage();
                });
            });
            
            chineseNameElements.forEach(elem => {
                elem.addEventListener('click', (e) => {
                    e.stopPropagation();
                    toggleLanguage();
                });
            });
        })
        .catch(error => console.log(error));

    // Load markdown content
    marked.use({ mangle: false, headerIds: false })
    section_names.forEach((name, idx) => {
        fetch(content_dir + name + suffix + '.md')
            .then(response => response.text())
            .then(markdown => {
                const html = marked.parse(markdown);
                document.getElementById(name + '-md').innerHTML = html;
            }).then(() => {
                // MathJax
                MathJax.typeset();
            })
            .catch(error => console.log(error));
    })
}


window.addEventListener('DOMContentLoaded', event => {

    // Activate Bootstrap scrollspy on the main nav element
    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            offset: 74,
        });
    };

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });

    // Load initial content
    const currentLang = getCurrentLanguage();
    loadContent(currentLang);

}); 
