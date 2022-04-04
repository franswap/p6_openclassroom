// On importe le modele thing que l'on vient de creer:
const Thing = require('../models/Thing');

exports.createThing = (req, res, next) =>{
    const thingObject = JSON.parse(req.body.thing);
    delete thingObject._id;
    const thing = new Thing({
        // '...' est l'operateur spread, il permet de faire une copîe de tous les elements de req.body
        ...thingObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    thing.save() // save enregistre thing dans la base de données
    .then(() => res.status(201).json({ message: 'Objet enregistré'}))
    .catch(error => res.status(400).json({error}));
};

exports.modifyThing = (res, req, next) => {
    const thingObject = req.file ?
    { 
        ...JSON.parse(req.body.thing),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body};
    // UpdateOne va nous permettre de modifier un element de la base de données, le premiere argument c'est l'objet de comparaison et l'autre cest le nouvel objet que l'on envoie
    Thing.updateOne({ _id: req.params.id}, { ...thingObject, _id: req.params.id})
        .then(() => res.status(200).json({ message: 'objet modifié'}))
        .catch(error => res.status(400).json({ error }));
};

exports.deleteThing = (req, res, next) => {
    // deleteOne va nous permettre de supprimer un élément de notre base de données
    Thing.findOne({ _id: req.params.id}).then(
        (thing) => {
            if (!thing) { //Si on a pas d'objet 
                return res.status(404).json({
                    error: new Error('Objet non trouvé')
                });
            } // Si l'utilisateur n'est pas le proprietaire de cet objet
            if (thing.userId !== req.auth.userId) {
                return res.status(401).json({
                    error: new Error('requete non authorisé')
                });
            }
            Thing.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Objet supprimé !'}))
            .catch(error => res.status(400).json({ error }));
        }
    )
};

exports.getOneThing = (req, res, next) => {
    Thing.findOne({_id: req.params.id}) // FindOne retourne une seul thing sur un systeme de comparaison des id
    .then(thing => res.status(200).json(thing))
    .catch(error => res.status(400).json({ error }));
};

exports.getAllThing = (req, res, next) => {
    Thing.find() // find renvoie un tableau de tous mes Things
    .then(things => res.status(200).json(things))
    .catch(error => res.status(400).json({ error }));
};