(async function () {

    const parse_table_xyz = (source) => {
        return source
            .split(/\r?\n/)
            .map(line => line.trim())
            .filter(line => line && !line.startsWith('%'))
            .map(line => {
                const parts = line.split(/\s+/);
                return {
                    x: Number(parts[0]),
                    y: Number(parts[1]),
                    z: Number(parts[2])
                };
            });
    };

    const load_xyz_series = async (path) => {
        try {
            const response = await fetch(path);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            const text = await response.text();
            return parse_table_xyz(text);
        } catch (error) {
            console.warn(`Unable to load ${path}:`, error);
            return [];
        }
    };

    const make_line_trace_3d = (series, name, color, showlegend = true, legendgroup = null) => ({
        type: 'scatter3d',
        mode: 'lines',
        name,
        legendgroup: legendgroup || name,
        showlegend,
        x: series.map(p => p.x),
        y: series.map(p => p.y),
        z: series.map(p => p.z),
        line: { color, width: 4 },
        hoverinfo: 'name+x+y+z',
    });

    const make_marker_trace_3d = (points, name, color, symbol, size, showlegend = true, z = 0) => ({
        type: 'scatter3d',
        mode: 'markers',
        name,
        x: points.map(p => p[0]),
        y: points.map(p => p[1]),
        z: points.map(() => z),
        marker: { color, size, symbol },
        hoverinfo: 'name+x+y+z',
        showlegend,
    });

    const x100_0033 = await load_xyz_series('./data/trajectory_L_dynamique6x100dis2_0033.txt');
    const x100_0034 = await load_xyz_series('./data/trajectory_L_dynamique6x100dis2_0034.txt');
    const x100_0035 = await load_xyz_series('./data/trajectory_L_dynamique6x100dis2_0035.txt');

    const x200_0030 = await load_xyz_series('./data/trajectory_L_dynamique6x200dis2_0030.txt');
    const x200_0031 = await load_xyz_series('./data/trajectory_L_dynamique6x200dis2_0031.txt');
    const x200_0032 = await load_xyz_series('./data/trajectory_L_dynamique6x200dis2_0032.txt');

    const y100dis1_0018 = await load_xyz_series('./data/trajectory_L_dynamique6y100dis1_0018.txt');
    const y100dis1_0019 = await load_xyz_series('./data/trajectory_L_dynamique6y100dis1_0019.txt');
    const y100dis1_0020 = await load_xyz_series('./data/trajectory_L_dynamique6y100dis1_0020.txt');

    const y100dis2_0021 = await load_xyz_series('./data/trajectory_L_dynamique6y100dis2_0021.txt');
    const y100dis2_0022 = await load_xyz_series('./data/trajectory_L_dynamique6y100dis2_0022.txt');
    const y100dis2_0023 = await load_xyz_series('./data/trajectory_L_dynamique6y100dis2_0023.txt');

    const y200dis1_0024 = await load_xyz_series('./data/trajectory_L_dynamique6y200dis1_0024.txt');
    const y200dis1_0025 = await load_xyz_series('./data/trajectory_L_dynamique6y200dis1_0025.txt');
    const y200dis1_0026 = await load_xyz_series('./data/trajectory_L_dynamique6y200dis1_0026.txt');

    const y200dis2_0027 = await load_xyz_series('./data/trajectory_L_dynamique6y200dis2_0027.txt');
    const y200dis2_0028 = await load_xyz_series('./data/trajectory_L_dynamique6y200dis2_0028.txt');
    const y200dis2_0029 = await load_xyz_series('./data/trajectory_L_dynamique6y200dis2_0029.txt');

    const traces = [];

    traces.push(make_marker_trace_3d([[0, 0]], 'fixed point', 'black', 'square', 8, true, 0));

    traces.push(make_line_trace_3d(x100_0033, 'surge, 0.3 m/s, 2 m', '#1f77b4', true, 'surge_03_2'));
    traces.push(make_line_trace_3d(x200_0030, 'surge, 0.6 m/s, 2 m', 'violet', true, 'surge_06_2'));
    traces.push(make_line_trace_3d(y100dis1_0018, 'sway, 0.3 m/s, 1.5 m', 'magenta', true, 'sway_03_15'));
    traces.push(make_line_trace_3d(y100dis2_0021, 'sway, 0.3 m/s, 2 m', 'olive', true, 'sway_03_2'));
    traces.push(make_line_trace_3d(y200dis1_0024, 'sway, 0.6 m/s, 1.5 m', 'orange', true, 'sway_06_15'));
    traces.push(make_line_trace_3d(y200dis2_0027, 'sway, 0.6 m/s, 2 m', 'red', true, 'sway_06_2'));

    traces.push(make_line_trace_3d(x100_0034, '', '#1f77b4', false, 'surge_03_2'));
    traces.push(make_line_trace_3d(x100_0035, '', '#1f77b4', false, 'surge_03_2'));
    traces.push(make_line_trace_3d(x200_0031, '', 'violet', false, 'surge_06_2'));
    traces.push(make_line_trace_3d(x200_0032, '', 'violet', false, 'surge_06_2'));
    traces.push(make_line_trace_3d(y100dis1_0019, '', 'magenta', false, 'sway_03_15'));
    traces.push(make_line_trace_3d(y100dis1_0020, '', 'magenta', false, 'sway_03_15'));
    traces.push(make_line_trace_3d(y100dis2_0022, '', 'olive', false, 'sway_03_2'));
    traces.push(make_line_trace_3d(y100dis2_0023, '', 'olive', false, 'sway_03_2'));
    traces.push(make_line_trace_3d(y200dis1_0025, '', 'orange', false, 'sway_06_15'));
    traces.push(make_line_trace_3d(y200dis1_0026, '', 'orange', false, 'sway_06_15'));
    traces.push(make_line_trace_3d(y200dis2_0028, '', 'red', false, 'sway_06_2'));
    traces.push(make_line_trace_3d(y200dis2_0029, '', 'red', false, 'sway_06_2'));

    const layout = {
        scene: {
            font: { family: "JetBrains Mono" },
            xaxis: {
                title: { text: 'x / m', font: { family: "JetBrains Mono", size: 18 } },
                tickfont: { family: "JetBrains Mono", size: 14 },
                zeroline: true,
                showgrid: true,
                range: [-2.31, 0.105],
            },
            yaxis: {
                title: { text: 'y / m', font: { family: "JetBrains Mono", size: 18 } },
                tickfont: { family: "JetBrains Mono", size: 14 },
                zeroline: true,
                showgrid: true,
                range: [-0.989, 1.428],
            },
            zaxis: {
                title: { text: 'z / m', font: { family: "JetBrains Mono", size: 18 } },
                tickfont: { family: "JetBrains Mono", size: 14 },
                zeroline: true,
                showgrid: true,
                range: [-0.8485, 0.105],
            },
            camera: {
                eye: { x: 0.5, y: 0.5, z: 1.5 },
            },
        },
        legend: {
            font: { family: "JetBrains Mono", size: 19 },
            orientation: 'h',
            x: 0.5,
            y: -0.1,
            xanchor: 'center',
            yanchor: 'top',
        },
        showlegend: true,
    };

    const container6 = document.getElementById('cable-6-trajectories');
    if (container6) {
        Plotly.newPlot(container6, traces, layout, { responsive: true, showTips: false });
    }

    // ------- Cable (3): two pairs cable trajectories ---------

    const x100_0125 = await load_xyz_series('./data/trajectory_L_dynamique3x100dis2_0125.txt');
    const x100_0126 = await load_xyz_series('./data/trajectory_L_dynamique3x100dis2_0126.txt');
    const x100_0127 = await load_xyz_series('./data/trajectory_L_dynamique3x100dis2_0127.txt');

    const x200_0122 = await load_xyz_series('./data/trajectory_L_dynamique3x200dis2_0122.txt');
    const x200_0123 = await load_xyz_series('./data/trajectory_L_dynamique3x200dis2_0123.txt');
    const x200_0124 = await load_xyz_series('./data/trajectory_L_dynamique3x200dis2_0124.txt');

    const y100dis1_0116 = await load_xyz_series('./data/trajectory_L_dynamique3y100dis1_0116.txt');
    const y100dis1_0117 = await load_xyz_series('./data/trajectory_L_dynamique3y100dis1_0117.txt');
    const y100dis1_0118 = await load_xyz_series('./data/trajectory_L_dynamique3y100dis1_0118.txt');

    const y100dis2_0119 = await load_xyz_series('./data/trajectory_L_dynamique3y100dis2_0119.txt');
    const y100dis2_0120 = await load_xyz_series('./data/trajectory_L_dynamique3y100dis2_0120.txt');
    const y100dis2_0121 = await load_xyz_series('./data/trajectory_L_dynamique3y100dis2_0121.txt');

    const y200dis1_0110 = await load_xyz_series('./data/trajectory_L_dynamique3y200dis1_0110.txt');
    const y200dis1_0111 = await load_xyz_series('./data/trajectory_L_dynamique3y200dis1_0111.txt');
    const y200dis1_0112 = await load_xyz_series('./data/trajectory_L_dynamique3y200dis1_0112.txt');

    const y200dis2_0113 = await load_xyz_series('./data/trajectory_L_dynamique3y200dis2_0113.txt');
    const y200dis2_0114 = await load_xyz_series('./data/trajectory_L_dynamique3y200dis2_0114.txt');
    const y200dis2_0115 = await load_xyz_series('./data/trajectory_L_dynamique3y200dis2_0115.txt');

    const traces3 = [];

    traces3.push(make_marker_trace_3d([[0, 0]], 'fixed point', 'black', 'square', 8, true, 0));

    // Main representatives for legend
    traces3.push(make_line_trace_3d(x100_0125, 'surge, 0.3 m/s, 2 m', '#1f77b4', true, 'surge3_03_2'));
    traces3.push(make_line_trace_3d(x200_0122, 'surge, 0.6 m/s, 2 m', 'violet', true, 'surge3_06_2'));
    traces3.push(make_line_trace_3d(y100dis1_0116, 'sway, 0.3 m/s, 1.5 m', 'magenta', true, 'sway3_03_15'));
    traces3.push(make_line_trace_3d(y100dis2_0119, 'sway, 0.3 m/s, 2 m', 'olive', true, 'sway3_03_2'));
    traces3.push(make_line_trace_3d(y200dis1_0110, 'sway, 0.6 m/s, 1.5 m', 'orange', true, 'sway3_06_15'));
    traces3.push(make_line_trace_3d(y200dis2_0113, 'sway, 0.6 m/s, 2 m', 'red', true, 'sway3_06_2'));

    // Additional realisations, hidden from legend but grouped by same motion/parameters
    traces3.push(make_line_trace_3d(x100_0126, '', '#1f77b4', false, 'surge3_03_2'));
    traces3.push(make_line_trace_3d(x100_0127, '', '#1f77b4', false, 'surge3_03_2'));
    traces3.push(make_line_trace_3d(x200_0123, '', 'violet', false, 'surge3_06_2'));
    traces3.push(make_line_trace_3d(x200_0124, '', 'violet', false, 'surge3_06_2'));
    traces3.push(make_line_trace_3d(y100dis1_0117, '', 'magenta', false, 'sway3_03_15'));
    traces3.push(make_line_trace_3d(y100dis1_0118, '', 'magenta', false, 'sway3_03_15'));
    traces3.push(make_line_trace_3d(y100dis2_0120, '', 'olive', false, 'sway3_03_2'));
    traces3.push(make_line_trace_3d(y100dis2_0121, '', 'olive', false, 'sway3_03_2'));
    traces3.push(make_line_trace_3d(y200dis1_0111, '', 'orange', false, 'sway3_06_15'));
    traces3.push(make_line_trace_3d(y200dis1_0112, '', 'orange', false, 'sway3_06_15'));
    traces3.push(make_line_trace_3d(y200dis2_0114, '', 'red', false, 'sway3_06_2'));
    traces3.push(make_line_trace_3d(y200dis2_0115, '', 'red', false, 'sway3_06_2'));

    const layout3 = {
        scene: {
            font: { family: "JetBrains Mono" },
            xaxis: {
                title: { text: 'x / m', font: { family: "JetBrains Mono", size: 18 } },
                tickfont: { family: "JetBrains Mono", size: 14 },
                zeroline: true,
                showgrid: true,
                range: [-1.7639, 0.3993],
            },
            yaxis: {
                title: { text: 'y / m', font: { family: "JetBrains Mono", size: 18 } },
                tickfont: { family: "JetBrains Mono", size: 14 },
                zeroline: true,
                showgrid: true,
                range: [-0.105, 2.9855],
            },
            zaxis: {
                title: { text: 'z / m', font: { family: "JetBrains Mono", size: 18 } },
                tickfont: { family: "JetBrains Mono", size: 14 },
                zeroline: true,
                showgrid: true,
                range: [-0.6288, 0.3216],
            },
            camera: {
                eye: { x: 0.5, y: 0.5, z: 1.5 },
            },
            aspectmode: 'manual',
            aspectratio: { x: 1, y: 1, z: 1 },
        },
        legend: {
            font: { family: "JetBrains Mono", size: 19 },
            orientation: 'h',
            x: 0.5,
            y: -0.1,
            xanchor: 'center',
            yanchor: 'top',
        },
        showlegend: true,
    };

    const container3 = document.getElementById('cable-3-trajectories');
    if (container3) {
        Plotly.newPlot(container3, traces3, layout3, { responsive: true, showTips: false });
    }

})();
