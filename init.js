
(async function () {

	Chart.defaults.font.family = 'JetBrains Mono, monospace';

	async function loadMacros(path) {
		try {
			const response = await fetch(path);
			if (!response.ok) {
				throw new Error(`HTTP ${response.status}`);
			}
			const source = await response.text();
			return parseTeXMacros(source);
		} catch (error) {
			console.warn('Reveal.js: unable to load TeX macros from', path, error);
			return {};
		}
	}

	function parseTeXMacros(source) {
		const macros = {};
		const regex = /\\newcommand\s*\\([a-zA-Z@]+)(?:\s*\[(\d+)\])?\s*\{/g;
		let match;
		while ((match = regex.exec(source)) !== null) {
			const name = match[1];
			const argCount = match[2] ? parseInt(match[2], 10) : 0;
			const bodyStart = regex.lastIndex;
			let depth = 1;
			let i = bodyStart;
			const bodyChars = [];
			while (i < source.length && depth > 0) {
				const ch = source[i];
				if (ch === '{') {
					depth += 1;
				} else if (ch === '}') {
					depth -= 1;
					if (depth === 0) {
						i += 1;
						break;
					}
				}
				bodyChars.push(ch);
				i += 1;
			}
			regex.lastIndex = i;
			const definition = bodyChars.join('').trim();
			if (definition) {
				macros[name] = argCount > 0 ? [definition, argCount] : definition;
			}
		}
		return macros;
	}

	const macros = await loadMacros('./macros.tex');

	Reveal.initialize({

		history: true,
		transition: 'slide',
		transitionSpeed: 'fast',
		center: false,
		slideNumber: 'c/t',
		progress: false,
		navigationMode: 'linear',

		width: 1920,
		height: 1080,

		mathjax3: {
			mathjax: './node_modules/mathjax/es5/tex-chtml.js',
			tex: {
				inlineMath: [
					['$', '$'],
					['\\(', '\\)'],
				],
				macros,
			},
			options: {
				skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
			},
		},

		// There are three typesetters available
		// RevealMath.MathJax2 (default)
		// RevealMath.MathJax3
		// RevealMath.KaTeX
		plugins: [
			RevealMath.MathJax3,
			RevealNotes,
			RevealChart
		]
	});

	Reveal.on('ready', () => {
		try {
			const rn = document.querySelector('.reveal > .slide-number, .reveal .slides ~ .slide-number');
			if (rn) {
				rn.style.fontFamily = getComputedStyle(document.documentElement).getPropertyValue('--r-main-font') || 'JetBrains Mono, monospace';
				rn.style.fontSize = '35px';
				rn.style.fontWeight = 'bolder';
				rn.style.paddingLeft = '1cm';
				rn.style.left = '8px';
				rn.style.right = 'auto';
				rn.style.color = 'var(--r-main-color';
				rn.style.background = 'transparent';

			}
		} catch { /* ignore */ }
	});

	// Preload media thumbnails so videos/audio are visible before their fragment plays
	Reveal.on('ready', () => {
		document.querySelectorAll('video[data-play-on-fragment], audio[data-play-on-fragment]').forEach(m => {
			try {
				if (!m.preload || m.preload === 'none') m.preload = 'metadata';
				// Trigger loading if the browser hasn't started
				if (typeof m.load === 'function') m.load();
			} catch { /* ignore */ }

			// If the fragment is on a parent wrapper, keep that wrapper visible pre-fragment
			try {
				const isSelfFragment = m.classList.contains('fragment');
				if (!isSelfFragment) {
					const wrapperFrag = m.closest('.fragment');
					if (wrapperFrag) wrapperFrag.classList.add('keep-visible-fragment');
				}
			} catch { /* ignore */ }
		});
	});

	Reveal.on('fragmentshown', event => {
		const frag = event.fragment;
		if (!frag) return;

		// If this fragment has a fragment index, act on ALL fragments in the current slide with the same index
		const idx = frag.getAttribute('data-fragment-index');
		const slide = Reveal.getCurrentSlide();
		if (idx && slide) {
			const sameIndexFrags = slide.querySelectorAll(`.fragment[data-fragment-index="${idx}"]`);
			const media = [];
			sameIndexFrags.forEach(f => {
				if ((f.tagName === 'VIDEO' || f.tagName === 'AUDIO') && f.hasAttribute('data-play-on-fragment')) {
					media.push(f);
				}
				f.querySelectorAll('video[data-play-on-fragment], audio[data-play-on-fragment]').forEach(m => media.push(m));
			});
			media.forEach(m => {
				// Ensure metadata is loaded so the first frame can render pre-play
				try { if (m.preload !== 'auto') m.preload = 'metadata'; } catch { }
				try { m.play(); } catch { /* ignore */ }
			});
			return; // done
		}

		// Fallback: handle only this fragment
		if ((frag.tagName === 'VIDEO' || frag.tagName === 'AUDIO') && frag.hasAttribute('data-play-on-fragment')) {
			try { if (frag.preload !== 'auto') frag.preload = 'metadata'; } catch { }
			try { frag.play(); } catch { /* ignore */ }
		}
		frag.querySelectorAll('video[data-play-on-fragment], audio[data-play-on-fragment]').forEach(m => {
			try { if (m.preload !== 'auto') m.preload = 'metadata'; } catch { }
			try { m.play(); } catch { /* ignore */ }
		});
	});

	Reveal.on('fragmenthidden', event => {
		const frag = event.fragment;
		if (!frag) return;

		const idx = frag.getAttribute('data-fragment-index');
		const slide = Reveal.getCurrentSlide();
		const toHandle = [];
		if (idx && slide) {
			slide.querySelectorAll(`.fragment[data-fragment-index="${idx}"]`).forEach(f => {
				if ((f.tagName === 'VIDEO' || f.tagName === 'AUDIO') && f.hasAttribute('data-play-on-fragment')) {
					toHandle.push(f);
				}
				f.querySelectorAll('video[data-play-on-fragment], audio[data-play-on-fragment]').forEach(el => toHandle.push(el));
			});
		} else {
			if ((frag.tagName === 'VIDEO' || frag.tagName === 'AUDIO') && frag.hasAttribute('data-play-on-fragment')) {
				toHandle.push(frag);
			}
			frag.querySelectorAll('video[data-play-on-fragment], audio[data-play-on-fragment]').forEach(el => toHandle.push(el));
		}

		toHandle.forEach(m => {
			try { m.pause(); } catch { /* ignore */ }
			try { m.currentTime = 0; } catch { /* ignore */ }
		});
	});

	// When leaving a slide, stop and reset any playing media
	Reveal.on('slidechanged', (event) => {
		const prev = event.previousSlide;
		const current = event.currentSlide;
		[prev, current].forEach(sec => {
			if (!sec) return;
			sec.querySelectorAll('video[data-play-on-fragment], audio[data-play-on-fragment]').forEach(m => {
				try { m.pause(); } catch { /* ignore */ }
				try { m.currentTime = 0; } catch { /* ignore */ }
			});
		});
	});

	// Initialize Title-Footer once Reveal is ready (script tag is loaded in presentation.html)
	Reveal.on('ready', () => {
		try {
			if (typeof title_footer !== 'undefined' && title_footer && typeof title_footer.initialize === 'function') {
				title_footer.initialize(null, 'hsla(0, 0%, 100%, 0.00)');
			}
		} catch { /* ignore */ }
	});

})();
