(function () {
    const colors = {
        font: '#000',
        vertical: { border: '#0000ffff', background: '#0000ff69' },
        gamma: { border: '#ff0000ff', background: '#ff000069' },
        theta: { border: '#808000ff', background: '#80800069' },
        theta_gamma: { border: '#808080ff', background: '#80808069' },
        dynamic: { border: '#ff8c00ff', background: '#ff8c0069' },
        speed: '#000000ff',
        speed_command: '#000000ff'
    };

    const legend_labels = {
        vertical: 'vertical',
        gamma: 'γ-augmented',
        theta: 'θ-augmented',
        dynamic: 'finite difference',
        theta_gamma: 'θγ-augmented',
        speed: 'robot speed',
        speed_command: 'speed command',
        gamma_angle: 'angle γ',
        theta_angle: 'angle θ'
    };

    window.utils = window.utils || {};
    window.utils.colors = colors;
    window.utils.legend_labels = legend_labels;
})();
