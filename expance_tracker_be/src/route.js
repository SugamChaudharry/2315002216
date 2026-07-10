import { Router } from "express";
const expances = []
const app = Router();

app.post("/", (req,res) => {
    const {categoary, subCategoary, amount, description} = req.body;

    try {
        const expance = {
            categoary: categoary,
            amount: amount,
            subCategoary: subCategoary,
            description: description,
            date: new Date().toDateString()
        }

        expances.push(expance);

        return res.json({expance: expance})
    } catch (error) {
        console.log("error while creating expance")
    }
})

app.get("/", (req, res) => {
    try {
        return res.json({expances: expances})
    } catch (error) {
        console.log("error while geting expances")
    }
})

app.get("/totalCategoaryAmount/:Categoary", (req,res) => {
    const categoary = req.params.Categoary;

    try {
        const subCategoary = []
        const subCategoaryAmmouts = [];

        const categoaryExpances = expances.filter((value) => value.categoary != categoary)

        for (let i = 0 ; i<expances.length; i++){

            let categoaryExist = false;
            for(let j = 0; j<subCategoary.length; j++){

                if(expances[i].subCategoary == subCategoary[j]){
                    subCategoaryAmmouts[j] += expances[i].amount
                    categoaryExist = true;
                }
            }

            if(!categoaryExist){
                subCategoary.push(expances[i].subCategoary)
                subCategoaryAmmouts.push(expances[i].amount)
            }
        }
        
        const responce = [] // {catogary, totalAmount}

        for(let i = 0; i<subCategoary.length; i++){
            responce.push({subcategoary: subCategoary[i], totalAmount:subCategoaryAmmouts[i] });

        }


        return res.json({data: responce})
    } catch (error) {
        console.log("error while creating expance")
    }
})

export default app;