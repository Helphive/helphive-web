import { useMemo } from 'react';
import { Box } from '@mui/material';
import { BarChartOutlined } from '@mui/icons-material';
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
import { color, font } from '@/theme/tokens';
import { currentMonthIndex } from '../orderUtils';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

interface MonthlyChartProps {
    data: { month: string; amount: number }[];
    height?: number;
}

/** Monthly earnings as ink bars with the current month in coral. */
export default function MonthlyChart({ data, height = 240 }: MonthlyChartProps) {
    const current = currentMonthIndex(data);

    const chartData = useMemo(
        () => ({
            labels: data.map((d) => d.month),
            datasets: [
                {
                    label: 'Earnings',
                    data: data.map((d) => d.amount),
                    backgroundColor: data.map((_, i) =>
                        i === current ? color.coral500 : color.ink900
                    ),
                    borderRadius: 4,
                    maxBarThickness: 40,
                },
            ],
        }),
        [data, current]
    );

    const options = useMemo<ChartOptions<'bar'>>(
        () => ({
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: color.ink900,
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
                        color: color.ink500,
                        font: { family: font.family, size: 12, weight: 600 },
                    },
                },
                y: {
                    beginAtZero: true,
                    suggestedMax: 100,
                    border: { display: false },
                    grid: { color: color.line },
                    ticks: {
                        color: color.ink500,
                        font: { family: font.family, size: 12, weight: 600 },
                        maxTicksLimit: 5,
                        callback: (value) => `$${value}`,
                    },
                },
            },
        }),
        []
    );

    const hasData = data.some((d) => d.amount > 0);
    const summary = data.map((d) => `${d.month} ${formatMoney(d.amount)}`).join(', ');

    if (!hasData) {
        return (
            <EmptyState
                bare
                icon={<BarChartOutlined />}
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
