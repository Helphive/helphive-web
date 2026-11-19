import PageHeader from '@/components/ui/PageHeader';
import UiErrorState from '@/components/ui/ErrorState';

export { DetailSkeleton } from '@/components/ui/Skeletons';

interface ErrorStateProps {
    title: string;
    message: string;
    backTo: string;
    backLabel: string;
    onRetry?: () => void;
}

// Page-level error: header with a back link, then the design-system ErrorState.
export function ErrorState({ title, message, backTo, backLabel, onRetry }: ErrorStateProps) {
    return (
        <>
            <PageHeader title={title} backTo={backTo} backLabel={backLabel} />
            <UiErrorState
                title={`Could not load the ${title.toLowerCase()}`}
                message={message}
                onRetry={onRetry}
            />
        </>
    );
}
