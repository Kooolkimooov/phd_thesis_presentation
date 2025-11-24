(function () {
    const { colors } = window.utils || { colors: { font: '#000' } };

    const palette = {
        vs: '#111111',
        pp1: '#c0392b',
        pp2: '#1f77b4',
        mpc: '#2ca02c'
    };

    const lineStyle = {
        borderWidth: 4,
        tension: 0.15,
        pointRadius: 0
    };

    const scenarios = [
        {
            key: 'vs',
            label: 'Visual Servoing (inspired)',
            color: palette.vs,
            trackingPath: './data/vs_simulation__br_0_position_tracking_error_1758791034.txt',
            distancePath: './data/vs_simulation_distance_to_seafloor_1758791034.txt'
        },
        {
            key: 'pp1',
            label: 'Path Planning (systematic)',
            color: palette.pp1,
            trackingPath: './data/pp_simulation_1__br_0_position_tracking_error_1757607544.txt',
            distancePath: './data/pp_simulation_1_distance_to_seafloor_1757607544.txt'
        },
        {
            key: 'pp2',
            label: 'Path Planning (triggered)',
            color: palette.pp2,
            trackingPath: './data/pp_simulation_2__br_0_position_tracking_error_1758052568.txt',
            distancePath: './data/pp_simulation_2_distance_to_seafloor_1758052568.txt'
        },
        {
            key: 'mpc',
            label: 'Model Predictive Control',
            color: palette.mpc,
            trackingPath: './data/mpc_simulation__br_0_position_tracking_error_1757359864.txt',
            distancePath: './data/mpc_simulation_distance_to_seafloor_1757359864.txt'
        }
    ];

    const defaultLegendGenerateLabels = Chart.defaults.plugins.legend.labels.generateLabels;

    const createScenarioLegendOptions = () => ({
        position: 'bottom',
        labels: {
            color: colors.font,
            font: { size: 24 },
            generateLabels(chart) {
                const base = defaultLegendGenerateLabels(chart);
                const scenarioMap = new Map();
                base.forEach(item => {
                    const dataset = chart.data.datasets[item.datasetIndex];
                    if (!dataset) {
                        return;
                    }
                    const key = dataset.scenarioKey ?? dataset.legendLabel ?? dataset.label ?? `dataset-${item.datasetIndex}`;
                    const legendLabel = dataset.legendLabel ?? dataset.label ?? item.text ?? key;
                    const meta = chart.getDatasetMeta(item.datasetIndex);
                    if (!scenarioMap.has(key)) {
                        scenarioMap.set(key, {
                            ...item,
                            text: legendLabel,
                            fillStyle: dataset.borderColor,
                            strokeStyle: dataset.borderColor,
                            lineDash: dataset.borderDash || [],
                            lineWidth: dataset.borderWidth ?? lineStyle.borderWidth,
                            hidden: meta.hidden === true,
                            datasetIndex: item.datasetIndex,
                            scenarioKey: key
                        });
                    } else {
                        const entry = scenarioMap.get(key);
                        if (meta.hidden !== true) {
                            entry.hidden = false;
                        }
                    }
                });
                return Array.from(scenarioMap.values());
            }
        },
        onClick(evt, legendItem, legend) {
            const chart = legend.chart;
            const scenarioKey = legendItem.scenarioKey;
            let anyVisible = false;
            chart.data.datasets.forEach((dataset, index) => {
                const key = dataset.scenarioKey ?? dataset.legendLabel ?? dataset.label ?? `dataset-${index}`;
                if (key === scenarioKey) {
                    const meta = chart.getDatasetMeta(index);
                    const hidden = meta.hidden === null ? false : meta.hidden;
                    if (!hidden) {
                        anyVisible = true;
                    }
                }
            });

            chart.data.datasets.forEach((dataset, index) => {
                const key = dataset.scenarioKey ?? dataset.legendLabel ?? dataset.label ?? `dataset-${index}`;
                if (key === scenarioKey) {
                    const meta = chart.getDatasetMeta(index);
                    meta.hidden = anyVisible ? true : null;
                }
            });

            chart.update();
        }
    });

    const parseTrackingTable = (source) => {
        return source
            .split(/\r?\n/)
            .map(line => line.trim())
            .filter(line => line && !line.startsWith('%'))
            .map(line => {
                const parts = line.split(/\s+/);
                const record = {
                    time: Number(parts[0]),
                    ex: Number(parts[1]),
                    ey: Number(parts[2]),
                    ez: Number(parts[3])
                };
                return Number.isFinite(record.time) ? record : null;
            })
            .filter(Boolean);
    };

    const parseDistanceTable = (source) => {
        return source
            .split(/\r?\n/)
            .map(line => line.trim())
            .filter(line => line && !line.startsWith('%'))
            .map(line => {
                const parts = line.split(/\s+/).map(Number);
                const time = parts[0];
                if (!Number.isFinite(time) || parts.length < 2) {
                    return null;
                }
                const distances = parts.slice(1).filter(Number.isFinite);
                if (distances.length === 0) {
                    return null;
                }
                return { time, distances };
            })
            .filter(Boolean);
    };

    const loadTable = async (path, parser) => {
        if (!path) {
            return [];
        }
        try {
            const response = await fetch(path);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            const text = await response.text();
            return parser(text);
        } catch (error) {
            console.warn(`Unable to load ${path}:`, error);
            return [];
        }
    };

    const buildTrackingChart = async (canvas) => {
        try {
            const results = await Promise.all(
                scenarios.map(async (scenario) => {
                    const rows = await loadTable(scenario.trackingPath, parseTrackingTable);
                    return { scenario, rows };
                })
            );

            const available = results.filter(item => item.rows.length);
            if (!available.length) {
                return;
            }

            let maxTime = 0;
            let maxNorm = 0;

            const datasets = available.map(({ scenario, rows }) => {
                const data = rows.map(row => {
                    const value = Math.hypot(row.ex, row.ey, row.ez);
                    if (row.time > maxTime) {
                        maxTime = row.time;
                    }
                    if (value > maxNorm) {
                        maxNorm = value;
                    }
                    return { x: row.time, y: value };
                });

                const dataset = {
                    ...lineStyle,
                    label: scenario.label,
                    data,
                    borderColor: scenario.color,
                    yAxisID: 'error',
                    legendLabel: scenario.label,
                    scenarioKey: scenario.key
                };

                if (scenario.borderDash) {
                    dataset.borderDash = scenario.borderDash;
                }

                return dataset;
            });

            const xMax = maxTime > 0 ? maxTime : 1;
            const yMax = maxNorm > 0 ? maxNorm * 1.1 : 1;

            new Chart(canvas, {
                type: 'line',
                data: { datasets },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: { mode: 'index', intersect: false },
                    plugins: {
                        legend: createScenarioLegendOptions(),
                        tooltip: {
                            mode: 'index',
                            intersect: false
                        }
                    },
                    scales: {
                        x: {
                            type: 'linear',
                            min: 0,
                            max: 50.0,
                            title: {
                                display: true,
                                text: 'time / s',
                                color: colors.font,
                                font: { size: 20 }
                            },
                            ticks: {
                                color: colors.font,
                                font: { size: 20 }
                            },
                            border: { color: '#000000' }
                        },
                        error: {
                            type: 'linear',
                            min: 0,
                            max: 3.0,
                            title: {
                                display: true,
                                text: 'tracking error norm / m',
                                color: colors.font,
                                font: { size: 20 }
                            },
                            ticks: {
                                color: colors.font,
                                font: { size: 20 }
                            },
                            border: { color: '#000000' }
                        }
                    }
                }
            });
        } catch (error) {
            console.warn('Unable to render tracking comparison chart:', error);
        }
    };

    const buildLowestPointChart = async (canvas) => {
        try {
            const results = await Promise.all(
                scenarios.map(async (scenario) => {
                    const rows = await loadTable(scenario.distancePath, parseDistanceTable);
                    return { scenario, rows };
                })
            );

            const available = results.filter(item => item.rows.length);
            if (!available.length) {
                return;
            }

            let maxTime = 0;
            let minValue = Number.POSITIVE_INFINITY;
            let maxValue = Number.NEGATIVE_INFINITY;

            const datasets = [];
            const constraintDataset = {
                ...lineStyle,
                label: 'constraint',
                data: [],
                borderColor: '#333333',
                borderDash: [2, 6],
                yAxisID: 'constraint',
                order: 0,
                pointRadius: 0,
                pointHoverRadius: 0,
                fill: false,
                legendLabel: 'Constraint'
            };

            const cableStyles = [
                { description: 'cable 1', borderDash: [] },
                { description: 'cable 2', borderDash: [8, 6] },
                { description: 'cable 3', borderDash: [4, 6] }
            ];

            available.forEach(({ scenario, rows }) => {
                const colorBase = scenario.color;
                const cableDatasets = cableStyles.map(style => ({
                    ...lineStyle,
                    label: `${scenario.label} (${style.description})`,
                    data: [],
                    borderColor: colorBase,
                    borderDash: style.borderDash,
                    yAxisID: 'constraint',
                    order: 1,
                    pointHoverRadius: 0,
                    radius: 0,
                    legendLabel: scenario.label,
                    scenarioKey: scenario.key
                }));

                rows.forEach(row => {
                    if (row.time > maxTime) {
                        maxTime = row.time;
                    }
                    row.distances.forEach((distance, index) => {
                        if (!Number.isFinite(distance)) {
                            return;
                        }
                        if (distance < minValue) {
                            minValue = distance;
                        }
                        if (distance > maxValue) {
                            maxValue = distance;
                        }
                        const dataset = cableDatasets[index];
                        if (dataset) {
                            dataset.data.push({ x: row.time, y: distance });
                        }
                    });
                    constraintDataset.data.push({ x: row.time, y: 0 });
                });

                cableDatasets.forEach(ds => {
                    if (ds.data.length) {
                        datasets.push(ds);
                    }
                });
            });

            if (!constraintDataset.data.length && maxTime > 0) {
                constraintDataset.data.push({ x: 0, y: 0 }, { x: maxTime, y: 0 });
            }

            datasets.unshift(constraintDataset);

            if (!Number.isFinite(minValue)) {
                minValue = 0;
            }
            if (!Number.isFinite(maxValue)) {
                maxValue = 0;
            }

            const xMax = maxTime > 0 ? maxTime : 1;

            new Chart(canvas, {
                type: 'line',
                data: { datasets },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: { mode: 'index', intersect: false },
                    plugins: {
                        legend: createScenarioLegendOptions(),
                        tooltip: {
                            mode: 'index',
                            intersect: false
                        }
                    },
                    scales: {
                        x: {
                            type: 'linear',
                            min: 0,
                            max: 50.0,
                            title: {
                                display: true,
                                text: 'time / s',
                                color: colors.font,
                                font: { size: 20 }
                            },
                            ticks: {
                                color: colors.font,
                                font: { size: 20 }
                            },
                            border: { color: '#000000' }
                        },
                        constraint: {
                            type: 'linear',
                            min: -1.0,
                            max: 4.0,
                            title: {
                                display: true,
                                text: 'lowest distance to seafloor / m',
                                color: colors.font,
                                font: { size: 20 }
                            },
                            ticks: {
                                color: colors.font,
                                font: { size: 20 }
                            },
                            border: { color: '#000000' }
                        }
                    }
                }
            });
        } catch (error) {
            console.warn('Unable to render lowest-point comparison chart:', error);
        }
    };

    const trackingCanvas = document.getElementById('tracking-error');
    if (trackingCanvas) {
        buildTrackingChart(trackingCanvas);
    }

    const lowestCanvas = document.getElementById('lowest-point-constraint');
    if (lowestCanvas) {
        buildLowestPointChart(lowestCanvas);
    }
})();
