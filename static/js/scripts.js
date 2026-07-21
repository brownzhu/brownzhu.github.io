const CONTENT_DIRECTORY = 'contents/';
const CONFIG_FILES = {
    en: 'config.yml',
    zh: 'config-zh.yml',
};
const SECTION_NAMES = ['home', 'awards', 'experience', 'publications'];
const DEFAULT_LANGUAGE = 'en';
const DEFAULT_SECTION = 'home';

function normalizeLanguage(language) {
    return Object.prototype.hasOwnProperty.call(CONFIG_FILES, language) ? language : DEFAULT_LANGUAGE;
}

function normalizeSection(sectionName) {
    return SECTION_NAMES.includes(sectionName) ? sectionName : DEFAULT_SECTION;
}

function getStoredLanguage() {
    try {
        return localStorage.getItem('language');
    } catch (error) {
        console.warn('Unable to read the saved language preference.', error);
        return null;
    }
}

function getCurrentLanguage() {
    const requestedLanguage = new URLSearchParams(window.location.search).get('lang');
    return normalizeLanguage(requestedLanguage || getStoredLanguage() || DEFAULT_LANGUAGE);
}

function getCurrentSection() {
    return normalizeSection(window.location.hash.replace(/^#/, ''));
}

function saveLanguage(language) {
    try {
        localStorage.setItem('language', language);
    } catch (error) {
        console.warn('Unable to save the language preference.', error);
    }
}

function updateLanguageUrl(language) {
    const url = new URL(window.location.href);
    url.searchParams.set('lang', language);
    window.history.replaceState({}, '', url);
}

function updateSectionUrl(sectionName) {
    const url = new URL(window.location.href);
    url.hash = sectionName;
    window.history.pushState({ section: sectionName }, '', url);
}

async function fetchText(path) {
    const response = await fetch(path);
    if (!response.ok) {
        throw new Error(`Unable to load ${path}: HTTP ${response.status}`);
    }
    return response.text();
}

function applyConfiguration(configuration) {
    Object.entries(configuration).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.innerHTML = value;
        } else {
            console.warn(`Configuration key does not match an element id: ${id}`);
        }
    });
}

function showSection(sectionName, options = {}) {
    const normalizedSection = normalizeSection(sectionName);
    const shouldFocus = options.focus === true;

    document.querySelectorAll('[data-section-panel]').forEach((panel) => {
        const isActive = panel.dataset.sectionPanel === normalizedSection;
        panel.hidden = !isActive;
        panel.classList.toggle('is-active', isActive);
    });

    document.querySelectorAll('[data-section]').forEach((link) => {
        const isActive = link.dataset.section === normalizedSection;
        link.classList.toggle('is-active', isActive);
        if (isActive) {
            link.setAttribute('aria-current', 'page');
        } else {
            link.removeAttribute('aria-current');
        }
    });

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

    if (shouldFocus) {
        const activePanel = document.querySelector(`[data-section-panel="${normalizedSection}"]`);
        const heading = activePanel.querySelector('[tabindex="-1"], .main-body h2, .main-body h3');
        if (heading) {
            heading.setAttribute('tabindex', '-1');
            heading.focus({ preventScroll: true });
        } else {
            document.getElementById('content-workspace').focus({ preventScroll: true });
        }
    }
}

async function typesetMath() {
    if (!window.MathJax?.typesetPromise) {
        return;
    }
    if (window.MathJax.startup?.promise) {
        await window.MathJax.startup.promise;
    }
    await window.MathJax.typesetPromise();
}

async function loadContent(language) {
    const currentLanguage = normalizeLanguage(language);
    const suffix = currentLanguage === 'zh' ? '-zh' : '';
    document.documentElement.lang = currentLanguage === 'zh' ? 'zh-CN' : 'en';

    const contentPaths = SECTION_NAMES.map(
        (sectionName) => `${CONTENT_DIRECTORY}${sectionName}${suffix}.md`,
    );

    try {
        const [configurationText, ...markdownFiles] = await Promise.all([
            fetchText(`${CONTENT_DIRECTORY}${CONFIG_FILES[currentLanguage]}`),
            ...contentPaths.map(fetchText),
        ]);

        applyConfiguration(jsyaml.load(configurationText));

        SECTION_NAMES.forEach((sectionName, index) => {
            document.getElementById(`${sectionName}-md`).innerHTML = marked.parse(markdownFiles[index]);
        });

        const languageToggle = document.getElementById('language-toggle');
        languageToggle.setAttribute(
            'aria-label',
            currentLanguage === 'zh' ? 'Switch to English' : '切换到中文',
        );

        showSection(getCurrentSection());
        await typesetMath();
    } catch (error) {
        console.error('Unable to load website content.', error);
        document.getElementById('home-md').innerHTML =
            '<p class="text-danger" role="alert">Unable to load the page content. Please refresh and try again.</p>';
        showSection(DEFAULT_SECTION);
    }
}

function setLanguage(language) {
    const normalizedLanguage = normalizeLanguage(language);
    saveLanguage(normalizedLanguage);
    updateLanguageUrl(normalizedLanguage);
    return loadContent(normalizedLanguage);
}

window.addEventListener('DOMContentLoaded', () => {
    marked.use({ mangle: false, headerIds: false });

    document.querySelectorAll('[data-section]').forEach((link) => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const nextSection = normalizeSection(link.dataset.section);
            if (getCurrentSection() !== nextSection) {
                updateSectionUrl(nextSection);
            }
            showSection(nextSection, { focus: true });
        });
    });

    document.querySelector('.site-brand').addEventListener('click', (event) => {
        event.preventDefault();
        if (getCurrentSection() !== DEFAULT_SECTION) {
            updateSectionUrl(DEFAULT_SECTION);
        }
        showSection(DEFAULT_SECTION, { focus: true });
    });

    document.getElementById('language-toggle').addEventListener('click', () => {
        const nextLanguage = document.documentElement.lang === 'zh-CN' ? 'en' : 'zh';
        setLanguage(nextLanguage);
    });

    window.addEventListener('popstate', () => {
        showSection(getCurrentSection(), { focus: true });
    });

    window.addEventListener('hashchange', () => {
        showSection(getCurrentSection(), { focus: true });
    });

    showSection(getCurrentSection());
    loadContent(getCurrentLanguage());
});
