
(function () {

	Reveal.initialize({
		history: true,
		transition: 'linear',
		center: false,

		dependencies:
			[
				{
					src: './vendor/Reveal-Title-Footer/plugin/title-footer/title-footer.js',
					async: true, callback: function () {
						title_footer.initialize(null, 'hsla(0, 0%, 100%, 0.00)');
					}
				}
			],
		mathjax2: {
			config: 'TeX-AMS_HTML-full',
			TeX: {
				Macros: {
					R: '\\mathbb{R}',
					set: [ '\\left\\{#1 \\; ; \\; #2\\right\\}', 2 ]
					set: ['\\left\\{#1 \\; ; \\; #2\\right\\}', 2]
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
