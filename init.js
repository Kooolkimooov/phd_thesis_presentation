
(async function () {

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
		console.log('Loaded TeX macros:', macros);
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

		dependencies:
			[
				{
					src: './vendor/Reveal-Title-Footer/plugin/title-footer/title-footer.js',
					async: true, callback: function () {
						title_footer.initialize(null, 'hsla(0, 0%, 100%, 0.00)');
					}
				},
			],

		mathjax3: {
			mathjax: 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js',
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

		symbolperslideprogress: {
			position: "left", // left/right
			align: "horizontal", // vertical/horizontal
			symbolColor: "", // Colors like red/#ff0000/rgb(255, 0, 0)
			symbolActiveColor: "",
		},

		// There are three typesetters available
		// RevealMath.MathJax2 (default)
		// RevealMath.MathJax3
		// RevealMath.KaTeX
		plugins: [
			RevealMath.MathJax3,
			RelativeNumber,
			// OneTimer,
			RevealNotes
		]
	});
})();
