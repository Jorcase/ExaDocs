import { Button } from '@/components/ui/button';

interface Props {
    href: string;
    label?: string;
}

export default function PdfButton({ href, label = 'Exportar PDF' }: Props) {
    return (
        <Button asChild>
            <a href={href} target="_blank" rel="noreferrer">
                {label}
            </a>
        </Button>
    );
}
