export class ValidationService {
    /**
     * Проверяет, является ли аргумент null или undefined
     * @param value
     */
    static isNothing(value: any): boolean {
        return (value === undefined || value === null);
    }
}