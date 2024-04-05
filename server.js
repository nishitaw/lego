/********************************************************************************
*  WEB322 – Assignment 05
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Nishita Mukeshbhai Waghela Student ID:139672224  Date: 5-4-2024
*
*  Published URL: 
*
********************************************************************************/



 
const express = require('express');
const legoData = require('./modules/legoSets');

const app = express();
const port = 3030;

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

legoData.initialize().then(() => {
    app.get('/', (req, res) => {
        res.render('home', { page: '/' });
    });
    app.get('/about', (req, res) => {
      res.render('about', { page: '/about' });
  });
  app.get('/lego/sets', (req, res) => {
    const theme = req.query.theme;
    if (theme) {
        legoData.getSetsByTheme(theme)
            .then((sets) => res.render('sets', { sets, page: '/lego/sets' }))
            .catch((error) => res.status(404).render('404', { message: "No sets found for the matching theme." }));
    } else {
        legoData.getAllSets()
            .then((sets) => res.render('sets', { sets, page: '/lego/sets' }))
            .catch((error) => res.status(404).render('404', { message: "Error: " + error }));
    }
});
app.get('/lego/sets/:setNum', (req, res) => {
  const setNum = req.params.setNum;
  legoData.getSetByNum(setNum)
      .then((set) => res.render('set', { set }))
      .catch((error) => res.status(404).render('404', { message: "No sets found for the specific set number." }));
});

    app.get('/lego/addSet', (req, res) => {
      legoData.getAllThemes()
          .then((themes) => res.render('addSet', { themes }))
          .catch((error) => res.status(500).render('500', { message: `I'm sorry, but we have encountered the following error: ${error}` }));
  });

  app.post('/lego/addSet', (req, res) => {
      const setData = req.body;
      legoData.addSet(setData)
          .then(() => res.redirect('/lego/sets'))
          .catch((error) => res.status(500).render('500', { message: `I'm sorry, but we have encountered the following error: ${error}` }));
  });
   
    app.get('/lego/editSet/:num', (req, res) => {
      const setNum = req.params.num;
      
      Promise.all([
          legoData.getSetByNum(setNum),
          legoData.getAllThemes()
      ])
      .then(([set, themes]) => {
          res.render('editSet', { set, themes });
      })
      .catch((error) => {
          res.status(404).render('404', { message: error });
      });
  });

  app.post('/lego/editSet', (req, res) => {
      const { set_num, ...setData } = req.body;
      legoData.editSet(set_num, setData)
          .then(() => res.redirect('/lego/sets'))
          .catch((error) => res.status(500).render('500', { message: `I'm sorry, but we have encountered the following error: ${error}` }));
  });

  app.get('/lego/deleteSet/:num', (req, res) => {
      const setNum = req.params.num;
      legoData.deleteSet(setNum)
          .then(() => res.redirect('/lego/sets'))
          .catch((error) => res.render('500', { message: `I'm sorry, but we have encountered the following error: ${error}` }));
  });

    app.use((req, res) => {
        res.status(404).render('404', { message: "No view matched for the specific route." });
    });

    app.listen(port, () => {
        console.log(`Server is running at http://localhost:${port}`);
    });
}).catch((error) => {
    console.error('Error initializing Lego data:', error);
});