
(function() {
	// Ensure Reveal is available before initializing
	if (typeof Reveal === 'undefined' || typeof RevealMath === 'undefined') {
		console.error('Reveal.js or RevealMath not found. Ensure scripts are loaded before init.js');
		return;
	}

	// Initialize Reveal with MathJax 2 and custom TeX macros
	Reveal.initialize({
		history: true,
		transition: 'linear',

		mathjax2: {
			config: 'TeX-AMS_HTML-full',
			TeX: {
				Macros: {
					R: '\\mathbb{R}',
					set: [ '\\left\\{#1 \\; ; \\; #2\\right\\}', 2 ]
				}
			}
		},

		// There are three typesetters available
		// RevealMath.MathJax2 (default)
		// RevealMath.MathJax3
		// RevealMath.KaTeX
		plugins: [ RevealMath.MathJax2 ]
	});
})();
