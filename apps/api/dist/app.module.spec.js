"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const app_module_1 = require("./app.module");
describe('AppModule', () => {
    let module;
    beforeEach(async () => {
        module = await testing_1.Test.createTestingModule({
            imports: [app_module_1.AppModule],
        }).compile();
    });
    afterEach(async () => {
        if (module) {
            await module.close();
        }
    });
    it('should compile the module', () => {
        expect(module).toBeDefined();
    });
});
//# sourceMappingURL=app.module.spec.js.map