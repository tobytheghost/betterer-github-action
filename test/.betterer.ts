import { typescript } from '@betterer/typescript'

export default {
    'stricter typescript compilation': () =>
        typescript('test-tsconfig.json', {
            strict: true,
            noImplicitAny: true,
            strictNullChecks: true,
            strictFunctionTypes: true,
            strictPropertyInitialization: false,
            useDefineForClassFields: false,
        }).include("src/*.ts")
}
//.include('test/test-files/*.ts'),
