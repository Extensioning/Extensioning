import Extension, {Logger, Type} from './Library/Extension.js';

console.log('Create a Toolbar-Component.');

/* Wait, if the Engine was loaded... */
Extension.on('engineInit', () => {

    /* Create a new Component on the Browser... */
    Extension.createComponent(Type.TOOLBAR).then((component) => {

        /* Set the Components-Data...*/
        component.setText('My Button');
        component.setIcon('Assets/Icons/Red.png');
        component.onClick((event) => {
            console.log('Button was clicked!', event);
        });

    }).catch((error) => {
        Logger.error("ERR", error);
    });
});