import { typescript } from '@betterer/typescript'
import { tsquery } from '@betterer/tsquery'
import { regexp } from '@betterer/regexp'

export default {
    'stricter typescript compilation': () =>
        typescript('test/test-tsconfig.json', {
            strict: true,
            noImplicitAny: true,
            strictNullChecks: true,
            strictFunctionTypes: true,
            strictPropertyInitialization: false,
            useDefineForClassFields: false,
        })
}
//.include('test/test-files/*.ts'),
