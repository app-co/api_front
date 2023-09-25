export function generateAlphanumericString(): string {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const minLength = 26;
    const maxLength = 35;

    const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
    return Array.from({ length }, () => characters[Math.floor(Math.random() * characters.length)]).join('');
}