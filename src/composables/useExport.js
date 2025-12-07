import {useToast} from 'primevue/usetoast';

/**
 * Composable pour l'export de données en Excel et CSV
 */
export function useExport() {
    const toast = useToast();

    /**
     * Convertit un tableau d'objets en CSV
     */
    function convertToCSV(data, columns) {
        if (!data || data.length === 0) {
            return '';
        }

        // En-têtes
        const headers = columns.map((col) => col.header || col.field);
        const csvHeaders = headers.join(';');

        // Lignes de données
        const csvRows = data.map((row) => {
            return columns
                .map((col) => {
                    let value = col.field ? getNestedValue(row, col.field) : '';

                    // Formatter la valeur si une fonction est fournie
                    if (col.exportFormatter && typeof col.exportFormatter === 'function') {
                        value = col.exportFormatter(value, row);
                    }

                    // Échapper les guillemets et entourer de guillemets si nécessaire
                    if (value === null || value === undefined) {
                        return '';
                    }

                    const stringValue = String(value);
                    if (stringValue.includes(';') || stringValue.includes('"') || stringValue.includes('\n')) {
                        return `"${stringValue.replace(/"/g, '""')}"`;
                    }

                    return stringValue;
                })
                .join(';');
        });

        return csvHeaders + '\n' + csvRows.join('\n');
    }

    /**
     * Récupère une valeur imbriquée dans un objet (ex: 'category.name')
     */
    function getNestedValue(obj, path) {
        if (!path) return obj;
        return path.split('.').reduce((current, prop) => current?.[prop], obj);
    }

    /**
     * Télécharge un fichier CSV
     */
    function downloadCSV(data, columns, filename = 'export.csv') {
        try {
            const csv = convertToCSV(data, columns);
            const blob = new Blob(['\ufeff' + csv], {type: 'text/csv;charset=utf-8;'});
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);

            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.add({
                severity: 'success',
                summary: 'Export réussi',
                detail: `Fichier ${filename} téléchargé`,
                life: 3000
            });
        } catch (error) {
            console.error('Erreur lors de l\'export CSV:', error);
            toast.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Impossible d\'exporter les données',
                life: 3000
            });
        }
    }

    /**
     * Télécharge un fichier Excel (format simple via CSV avec extension xlsx)
     * Pour un vrai Excel, il faudrait utiliser une librairie comme xlsx
     */
    function downloadExcel(data, columns, filename = 'export.xlsx') {
        try {
            const csv = convertToCSV(data, columns);

            // Pour un export Excel simple, on peut utiliser le format CSV
            // Pour un vrai fichier Excel avec formatage, il faudrait xlsx library
            const blob = new Blob(['\ufeff' + csv], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8;'
            });

            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);

            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.add({
                severity: 'success',
                summary: 'Export réussi',
                detail: `Fichier ${filename} téléchargé`,
                life: 3000
            });
        } catch (error) {
            console.error('Erreur lors de l\'export Excel:', error);
            toast.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Impossible d\'exporter les données',
                life: 3000
            });
        }
    }

    /**
     * Formateur de prix pour l'export
     */
    function formatPrice(value) {
        if (value == null) return '';
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(Number(value));
    }

    /**
     * Formateur de date pour l'export
     */
    function formatDate(value) {
        if (!value) return '';
        return new Intl.DateTimeFormat('fr-FR', {
            dateStyle: 'short',
            timeStyle: 'short'
        }).format(new Date(value));
    }

    /**
     * Formateur de date simple pour l'export
     */
    function formatDateShort(value) {
        if (!value) return '';
        return new Intl.DateTimeFormat('fr-FR', {
            dateStyle: 'short'
        }).format(new Date(value));
    }

    return {
        downloadCSV,
        downloadExcel,
        formatPrice,
        formatDate,
        formatDateShort
    };
}
