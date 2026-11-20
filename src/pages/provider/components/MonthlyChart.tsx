import { useMemo } from 'react';
import { Box } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    type ChartOptions,
} from 'chart.js';
import { EmptyState } from '@/components/ui';
import { formatMoney } from '@/utils/format';
import { font, palettes } from '@/theme/tokens';
import { useColorScheme } from '@/theme/colorScheme';
import { currentMonthIndex } from '../orderUtils';
import { ChartIcon } from '@/components/ui/icons';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

interface MonthlyChartProps {
    data: { month: string; amount: number }[];
    height?: number;
}

/** Monthly earnings as ink bars with the current month in coral. */
export default function MonthlyChart({ data, height = 240 }: MonthlyChartProps) {
    const current = currentMonthIndex(data);
    // The chart draws on a canvas, which needs real colours; it redraws when the scheme changes.
    const { scheme } = useColorScheme();
    const p = palettes[scheme];
    const dark = scheme === 'dark';

    const chartData = useMemo(
        () => ({
            labels: data.map((d) => d.month),
            datasets: [
                {
                    label: 'Earnings',
                    data: data.map((d) => d.amount),
                    backgroundColor: data.map((_, i) =>
                        i === current ? p.coral500 : dark ? p.ink500 : p.ink900
                    ),
                    borderRadius: 4,
                    maxBarThickness: 40,
                },
            ],
        }),
        [data, current, p, dark]
    );

    const options = useMemo<ChartOptions<'bar'>>(
        () => ({
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: dark ? p.raised : p.inkFill,
                    titleColor: dark ? p.ink900 : p.onInk,
                    bodyColor: dark ? p.ink900 : p.onInk,
                    borderColor: dark ? p.lineStrong : 'transparent',
                    borderWidth: dark ? 1 : 0,
                    titleFont: { family: font.family, weight: 700 },
                    bodyFont: { family: font.family, weight: 600 },
                    displayColors: false,
                    callbacks: { label: (ctx) => formatMoney(ctx.parsed.y) },
                },
            },
            scales: {
                x: {
                    grid: { display: false },
                    border: { display: false },
                    ticks: {
                        color: p.ink500,
                        font: { family: font.family, size: 12, weight: 600 },
                    },
                },
                y: {
                    beginAtZero: true,
                    suggestedMax: 100,
                    border: { display: false },
                    grid: { color: p.line },
                    ticks: {
                        color: p.ink500,
                        font: { family: font.family, size: 12, weight: 600 },
                        maxTicksLimit: 5,
                        callback: (value) => `$${value}`,
                    },
                },
            },
        }),
        [p, dark]
    );

    const hasData = data.some((d) => d.amount > 0);
    const summary = data.map((d) => `${d.month} ${formatMoney(d.amount)}`).join(', ');

    if (!hasData) {
        return (
            <EmptyState
                bare
                icon={<ChartIcon />}
                title={`No earnings in the last ${data.length} months`}
                description="Completed jobs show up here as monthly totals."
                sx={{ height, justifyContent: 'center', py: 0 }}
            />
        );
    }

    return (
        <Box sx={{ height, position: 'relative' }}>
            <Bar
                data={chartData}
                options={options}
                role="img"
                aria-label={`Monthly earnings: ${summary}`}
            />
        </Box>
    );
}
