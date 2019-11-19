describe("Form functionality", () => {
    'use strict';

    describe("isNumber()", () => {
        it("Passing numbers should be true", () => {
            expect(isNumber(1)).toBe(true);
            expect(isNumber((1 - 2))).toBe(true);
            expect(isNumber(1.432)).toBe(true);
        });
        it("Passing values which are not numbers should be false", () => {
            expect(isNumber('String')).toBe(false);
            expect(isNumber()).toBe(false);
            expect(isNumber(['123', 23123])).toBe(false);
            expect(isNumber([])).toBe(false);
            expect(isNumber([123])).toBe(false);
            expect(isNumber({})).toBe(false);
        });
    });

    describe("isArray()", () => {
        it("Passing arrays should be true", () => {
            expect(isArray(['This is a string', 'Also a string'])).toBe(true);
            expect(isArray([])).toBe(true);
            expect(isArray([123, 123, 'Test'])).toBe(true);
        });
        it("Passing values which are not arrays should be false", () => {
            expect(isArray('String')).toBe(false);
            expect(isArray()).toBe(false);
            expect(isArray(123)).toBe(false);
        });
    });

    describe("isString()", () => {
        it("'This is a string' should be true", () => {
            expect(isString('This is a string')).toBe(true);
        });

        it("Passing values which are not strings should be false", () => {
            expect(isString()).toBe(false);
            expect(isString(1234)).toBe(false);
            expect(isString({})).toBe(false);
            expect(isString(['Test', 'Test'])).toBe(false);
        });
    });

    describe("getAttributePrefix()", () => {
        it("should return test-", () => {
            expect(getAttributePrefix("test-one")).toBe("test-");
        });
        it("should return test-test-", () => {
            expect(getAttributePrefix("test-test-oneonasd1one")).toBe("test-test-");
        });
        it("should return blank", () => {
            expect(getAttributePrefix("testonetwothree")).toBe("");
        });
        it("should return hello---", () => {
            expect(getAttributePrefix("hello---asdsadsad")).toBe("hello---");
        });
        it("123213213 should return blank", () => {
            expect(getAttributePrefix(123213213)).toBe("");
        });

        it("'' should return blank", () => {
            expect(getAttributePrefix()).toBe("");
        });
    });

    describe("pushValuesToArray()", () => {
        it("arr should equal arr2", () => {

            let arr = [];

            let arr2 = [{
                "ref": 'test',
                "prefix": 'test-',
                "attribute": 'name',
                "count": 1,
                "current": 1
            }];

            expect(pushValuesToArray(arr, 'test', 'test-', 'name', 1)).toEqual(arr2);
        });

        it("pass incorrect types to function should result in false", () => {
            expect(pushValuesToArray('', 'test', 'test-', 'name', 1)).toEqual(false);
            expect(pushValuesToArray('', '', 'test-', 'name', 1)).toEqual(false);
            expect(pushValuesToArray()).toEqual(false);
            expect(pushValuesToArray([], 12, 34, 56, 78)).toEqual(false);
        });
    });

    describe("getScalar()", () => {
        it("scalar = 1 expecting 1", () => {
            expect(getScalar('1')).toBe(1);
        });
        it("scalar = 4.5 expecting 1", () => {
            expect(getScalar('4.5')).toBe(1);
        });
        it("scalar = 7 expecting 52", () => {
            expect(getScalar('7')).toBe(52);
        });
        it("scalar = 14 expecting 1", () => {
            expect(getScalar('14')).toBe(26);
        });
        it("scalar = 28 expecting 1", () => {
            expect(getScalar('28')).toBe(13);
        });
        it("scalar = 30 expecting 1", () => {
            expect(getScalar('30')).toBe(12);
        });
        it("scalar = 60 expecting 6", () => {
            expect(getScalar('60')).toBe(6);
        });
        it("scalar = 72 expecting 1", () => {
            expect(getScalar('72')).toBe(1);
        });
        it("scalar = 0 expecting 1", () => {
            expect(getScalar('0')).toBe(1);
        });
        it("scalar = null expecting 1", () => {
            expect(getScalar()).toBe(1);
        });
        it("scalar = '' expecting 1", () => {
            expect(getScalar('')).toBe(1);
        });
        it("scalar = 'asdasd' expecting 1", () => {
            expect(getScalar('asdasd')).toBe(1);
        });
    });


    describe("validateText()", () => {
        it("Passing acceptable values should return true", () => {
            expect(validateText('Account-1')).toBe(true);
            expect(validateText('My Account')).toBe(true);
            expect(validateText(123123)).toBe(true);
            expect(validateText("1 Account")).toBe(true);
            expect(validateText("Bills&Things")).toBe(true);
            expect(validateText("This is less than 30 chars")).toBe(true);
            expect(validateText('My [Account]')).toBe(true);
        });

        it("Passing values which are not valid text should be false", () => {
            expect(validateText()).toBe(false);
            expect(validateText('$ 1 IJLW F& &23;')).toBe(false);
            expect(validateText('!"£$%^')).toBe(false);
            expect(validateText('"My Account"')).toBe(false);
            expect(validateText("This line is more than 30 characters")).toBe(false);
        });
    });


    describe("validateNumber()", () => {
        it("Passing numbers should be true", () => {
            expect(validateNumber(1)).toBe(true);
            expect(validateNumber((1 - 2))).toBe(true);
            expect(validateNumber(1.43)).toBe(true);
            expect(validateNumber(-1000)).toBe(true);
            expect(validateNumber('1000')).toBe(true);
        });
        it("Passing values which are not numbers should be false", () => {
            expect(validateNumber('String')).toBe(false);
            expect(validateNumber()).toBe(false);
            expect(validateNumber(['123', 23123])).toBe(false);
            expect(validateNumber(12.23123)).toBe(false);
            expect(validateNumber([])).toBe(false);
            expect(validateNumber([123, 122])).toBe(false);
            expect(validateNumber({})).toBe(false);
        });
    });

    describe("resetErrorMsg()", () => {
        it("check that this returns false when 'error' does not exist", () => {
            expect(resetErrorMsg()).toBe(false);
        });
    });


    describe("getTargetNodeID()", () => {
        document.body.innerHTML = `
            <div id="test2">
                <header id="test">
                    <header>
                        <article>
                            <div id="username" ></div>
                            <button id="button" />
                        </article>
                    </header>
                </header>
            </div>`;
        let button = document.querySelector('#button');
        let user = document.querySelector('#username');

        it("First parent div should equal 'test2'", () => {
            expect(getTargetNodeID(button, 'div')).toBe('test2');
        });
        it("First parent header should equal 'test'", () => {
            expect(getTargetNodeID(button, 'header')).toBe('test');
        });
        it("Passing no node name, should equal false", () => {
            expect(getTargetNodeID(button, '')).toBe(false);
        });
        it("passing no html element, should equal false", () => {
            expect(getTargetNodeID('', 'header')).toBe(false);
        });
        it("passing no string, should equal false", () => {
            expect(getTargetNodeID('', '')).toBe(false);
        });
        it("passing number, should equal false", () => {
            expect(getTargetNodeID(123123, 'div')).toBe(false);
        });
        it("checking for header node with an id attribute value, should return false", () => {
            expect(getTargetNodeID(user, 'article')).toBe(false);
        });
    });
});