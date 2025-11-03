(function () {

    const parseTable = (source) => {
        return source
            .split(/\r?\n/)
            .map(line => line.trim())
            .filter(line => line && !line.startsWith('%'))
            .map(line => {
                const parts = line.split(/\s+/);
                return { x: Number(parts[0]), y: Number(parts[1]) };
            });
    };

    const loadSeries = async (path) => {
        try {
            const response = await fetch(path);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            const text = await response.text();
            return parseTable(text);
        } catch (error) {
            console.warn(`Unable to load ${path}:`, error);
            return [];
        }
    };

    const colors = {
        font: '#000',
        vertical: '#0000ffff',
        gamma: '#ff0000ff',
        theta: '#00ff00ff',
        theta_gamma: '#808080ff',
        speed: '#000000ff',
        speed_command: '#000000ff',
    };

    const line_style = {
        borderWidth: 4,
        tension: 0.15,
        pointRadius: 0
    }

    const legend_labels = {
        vertical: 'vertical',
        gamma: 'γ-augmented',
        theta: 'θ-augmented',
        theta_gamma: 'θγ-augmented',
        speed: 'robot speed',
        speed_command: 'speed command',
        gamma_angle: 'angle γ',
        theta_angle: 'angle θ'
    };

    const data_files = {
        ve_surge_3: './data/e_vertical_L_dynamique3x200dis2_0122.txt',
        ge_surge_3: './data/e_gamma_L_dynamique3x200dis2_0122.txt',
        te_surge_3: './data/e_theta_gamma_L_dynamique3x200dis2_0122.txt',
        sp_surge_3: './data/speed_L_dynamique3x200dis2_0122.txt',
        ga_surge_3: './data/gamma_L_dynamique3x200dis2_0122.txt',
        ta_surge_3: './data/theta_L_dynamique3x200dis2_0122.txt',
        ve_surge_6: './data/e_vertical_L_dynamique6x200dis2_0031.txt',
        ge_surge_6: './data/e_gamma_L_dynamique6x200dis2_0031.txt',
        te_surge_6: './data/e_theta_gamma_L_dynamique6x200dis2_0031.txt',
        sp_surge_6: './data/speed_L_dynamique6x200dis2_0031.txt',
        ga_surge_6: './data/gamma_L_dynamique6x200dis2_0031.txt',
        ta_surge_6: './data/theta_L_dynamique6x200dis2_0031.txt',
    };

    const command_profile = [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 2, y: 0.6 },
        { x: 4.5, y: 0.6 },
        { x: 4.5, y: -1.2 },
        { x: 4.8, y: -1.2 },
        { x: 4.8, y: -0.3 },
        { x: 5, y: -0.3 },
        { x: 5, y: 0 },
        { x: 14.2, y: 0 }
    ];

    const x_axis = {
        type: 'linear',
        title: { display: true, text: 'time / s', color: colors.font, font: { size: 20 } },
        ticks: { color: colors.font, font: { size: 20 } },
        border: { color: '#000' }
    };

    const error_axis = {
        type: 'linear',
        position: 'left',
        title: { display: true, text: 'error / m', color: colors.font, font: { size: 20 } },
        ticks: { color: colors.font, font: { size: 20 } },
        border: { color: '#000' }
    };

    const speed_axis = {
        type: 'linear',
        position: 'left',
        title: { display: true, text: 'speed / m/s', color: colors.font, font: { size: 20 } },
        ticks: { color: colors.font, font: { size: 20 } },
        border: { color: '#000' }

    };

    const angle_axis = {
        type: 'linear',
        position: 'right',
        title: { display: true, text: 'angle / rad', color: colors.font, font: { size: 20 } },
        ticks: { color: colors.font, font: { size: 20 } },
        border: { color: '#000' }
    };

    const base_options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
            legend: {
                position: 'bottom',
                labels: { color: colors.font, font: { size: 24 } }
            },
            tooltip: {
                mode: 'index',
                intersect: false
            }
        }
    };

    const option_error_chart = Object.assign(
        {
            scales: {
                x: x_axis,
                error: error_axis
            },
            layout: {
                padding: {
                    left: 10,
                    right: 95,
                }
            }
        },
        base_options,
    );

    const option_speed_chart = Object.assign(
        {
            scales: {
                x: x_axis,
                speed: speed_axis,
                angle: angle_axis
            }
        },
        base_options,
    );

    (async () => {

        const [
            ve_surge_3,
            ge_surge_3,
            te_surge_3,
            sp_surge_3,
            ga_surge_3,
            ta_surge_3,
            ve_surge_6,
            ge_surge_6,
            te_surge_6,
            sp_surge_6,
            ga_surge_6,
            ta_surge_6
        ] = await Promise.all([
            loadSeries(data_files.ve_surge_3),
            loadSeries(data_files.ge_surge_3),
            loadSeries(data_files.te_surge_3),
            loadSeries(data_files.sp_surge_3),
            loadSeries(data_files.ga_surge_3),
            loadSeries(data_files.ta_surge_3),
            loadSeries(data_files.ve_surge_6),
            loadSeries(data_files.ge_surge_6),
            loadSeries(data_files.te_surge_6),
            loadSeries(data_files.sp_surge_6),
            loadSeries(data_files.ga_surge_6),
            loadSeries(data_files.ta_surge_6),
        ]);

        const charts = [];

        const cable_3_surge_error_canvas = document.getElementById('cable-3-surge-error');
        const cable_3_surge_error_chart = new Chart(cable_3_surge_error_canvas, {
            type: 'line',
            data: {
                datasets: [
                    Object.assign(
                        { label: legend_labels.vertical, data: ve_surge_3, borderColor: colors.vertical, yAxisID: 'error' },
                        line_style
                    ),
                    Object.assign(
                        { label: legend_labels.gamma, data: ge_surge_3, borderColor: colors.gamma, yAxisID: 'error' },
                        line_style
                    ),
                    Object.assign(
                        { label: legend_labels.theta_gamma, data: te_surge_3, borderColor: colors.theta_gamma, yAxisID: 'error' },
                        line_style
                    )
                ]
            },
            options: Object.assign({ scales: { x: { max: 14.2 } } }, option_error_chart),
        });

        charts.push(cable_3_surge_error_chart);


        const cable_3_surge_speed_canvas = document.getElementById('cable-3-surge-speed');
        const cable_3_surge_speed_chart = new Chart(cable_3_surge_speed_canvas, {
            type: 'line',
            data: {
                datasets: [
                    Object.assign(
                        { label: legend_labels.speed, data: sp_surge_3, borderColor: colors.speed, yAxisID: 'speed' },
                        line_style
                    ),
                    Object.assign(
                        { label: legend_labels.speed_command, data: command_profile, borderColor: colors.speed_command, yAxisID: 'speed' },
                        line_style,
                        { borderDash: [10, 8], stepped: true },
                    ),
                    Object.assign(
                        { label: legend_labels.gamma_angle, data: ga_surge_3, borderColor: colors.gamma, yAxisID: 'angle' },
                        line_style
                    ),
                    Object.assign(
                        { label: legend_labels.theta_angle, data: ta_surge_3, borderColor: colors.theta, yAxisID: 'angle' },
                        line_style
                    )
                ]
            },
            options: Object.assign({ scales: { x: { max: 14.2 } } }, option_speed_chart),
        });

        charts.push(cable_3_surge_speed_chart);

        const cable_6_surge_error_canvas = document.getElementById('cable-6-surge-error');
        const cable_6_surge_error_chart = new Chart(cable_6_surge_error_canvas, {
            type: 'line',
            data: {
                datasets: [
                    Object.assign(
                        { label: legend_labels.vertical, data: ve_surge_6, borderColor: colors.vertical, yAxisID: 'error' },
                        line_style
                    ),
                    Object.assign(
                        { label: legend_labels.gamma, data: ge_surge_6, borderColor: colors.gamma, yAxisID: 'error' },
                        line_style
                    ),
                    Object.assign(
                        { label: legend_labels.theta_gamma, data: te_surge_6, borderColor: colors.theta_gamma, yAxisID: 'error' },
                        line_style
                    )
                ]
            },
            options: Object.assign({ scales: { x: { max: 9.6 } } }, option_error_chart),
        });

        charts.push(cable_6_surge_error_chart);


        const cable_6_surge_speed_canvas = document.getElementById('cable-6-surge-speed');
        const cable_6_surge_speed_chart = new Chart(cable_6_surge_speed_canvas, {
            type: 'line',
            data: {
                datasets: [
                    Object.assign(
                        { label: legend_labels.speed, data: sp_surge_6, borderColor: colors.speed, yAxisID: 'speed' },
                        line_style
                    ),
                    Object.assign(
                        { label: legend_labels.speed_command, data: command_profile, borderColor: colors.speed_command, yAxisID: 'speed' },
                        line_style,
                        { borderDash: [10, 8], stepped: true },
                    ),
                    Object.assign(
                        { label: legend_labels.gamma_angle, data: ga_surge_6, borderColor: colors.gamma, yAxisID: 'angle' },
                        line_style
                    ),
                    Object.assign(
                        { label: legend_labels.theta_angle, data: ta_surge_6, borderColor: colors.theta, yAxisID: 'angle' },
                        line_style
                    )
                ]
            },
            options: Object.assign({ scales: { x: { max: 9.6 } } }, option_speed_chart),
        });

        charts.push(cable_6_surge_speed_chart);

    })();
})();
