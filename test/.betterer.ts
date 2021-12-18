import { typescript } from '@betterer/typescript'
import { tsquery } from '@betterer/tsquery'
import { regexp } from '@betterer/regexp'

export default {
    'stricter typescript compilation': () =>
        typescript('tsconfig.json', {
            strict: true,
            noImplicitAny: true,
            strictNullChecks: true,
            strictFunctionTypes: true,
            strictPropertyInitialization: false,
            useDefineForClassFields: false,
        }).include('test-files/*.ts'),
}
