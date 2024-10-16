import Extension, {Logger, Type} from './Library/Extension.js';

console.log('Create a Addressbar-Component.');

/* Wait, if the Engine was loaded... */
Extension.on('engineInit', () => {

    /* Create a new Component on the Browser... */
    Extension.createComponent(Type.ADDRESSBAR).then((component) => {

        /* Set the Components-Data...*/
        component.setText('My Button');
        component.setContent("MyContent.html");
        component.setIcon('Assets/Icons/Red.png');
        component.onClick((event) => {
            console.log('Button was clicked!', event);
        });

    }).catch((error) => {
        Logger.error("ERR", error);
    });
});