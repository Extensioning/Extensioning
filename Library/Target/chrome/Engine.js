export default (new class Engine {
    onInit(args) {
        console.log("INIT", args, new Error().stack);
    }

    createToolbar() {
        return new Promise((success, failure) => {
            success("createToolbar CHROME()");
        });
    }
}());