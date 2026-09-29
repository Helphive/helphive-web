import { Alert, Button, Card, CardContent, Skeleton, Stack } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { Refresh } from '@mui/icons-material';
import PageHeader from './PageHeader';

export function DetailSkeleton() {
    return (
        <Grid container spacing={3} aria-busy="true" aria-label="Loading">
            <Grid size={{ xs: 12 }}>
                <Skeleton variant="rounded" height={96} />
            </Grid>
            <Grid size={{ xs: 12, md: 7 }}>
                <Stack spacing={3}>
                    {[180, 220, 140].map((h) => (
                        <Card key={h}>
                            <CardContent>
                                <Skeleton width="30%" height={28} sx={{ mb: 1 }} />
                                <Skeleton variant="rounded" height={h - 60} />
                            </CardContent>
                        </Card>
                    ))}
                </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
                <Card>
                    <CardContent>
                        <Skeleton width="40%" height={28} sx={{ mb: 1 }} />
                        <Skeleton height={28} />
                        <Skeleton height={28} />
                        <Skeleton height={28} />
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
}

interface ErrorStateProps {
    title: string;
    message: string;
    backTo: string;
    backLabel: string;
    onRetry?: () => void;
}

export function ErrorState({ title, message, backTo, backLabel, onRetry }: ErrorStateProps) {
    return (
        <>
            <PageHeader title={title} backTo={backTo} backLabel={backLabel} />
            <Alert
                severity="error"
                action={
                    onRetry && (
                        <Button
                            color="inherit"
                            size="small"
                            startIcon={<Refresh />}
                            onClick={onRetry}
                        >
                            Retry
                        </Button>
                    )
                }
            >
                {message}
            </Alert>
        </>
    );
}
