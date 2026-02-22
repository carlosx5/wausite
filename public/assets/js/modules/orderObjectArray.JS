/** //:ORDENA ARRAY DE OBJETOS POR UMA ORDER PRÉ DEFINIDA
 *
 * @param {objectArray} objectArray - Array de objetos a ser ordenado [{ id: "1", name: "Maria" }, etc...]
 * @param {array} orderArray - Array com a ordem desejada (numeros=[4,6,7] ou string=['d','a','c'])
 * @param {string} idKey - Chave a ser ordenada ('id')
 * @returns
 */
export default (objectArray, orderArray, idKey) => {
    objectArray.sort((a, b) => {
        const indexA = orderArray.indexOf(a[idKey]);
        const indexB = orderArray.indexOf(b[idKey]);

        if (indexA !== -1 && indexB !== -1) {
            return indexA - indexB;
        }

        if (indexA !== -1) {
            return -1;
        }

        if (indexB !== -1) {
            return 1;
        }

        return false;
    });

    return objectArray;
};
