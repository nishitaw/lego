require('dotenv').config();
const Sequelize = require('sequelize');


// set up sequelize to point to our postgres database
const sequelize = new Sequelize('SenecaDB', 'SenecaDB_owner', 'HFdrP6vm2hqj', {
  host: 'ep-falling-base-a5avb5a6-pooler.us-east-2.aws.neon.tech',
  dialect: 'postgres',
  port: 5432,
  dialectOptions: {
    ssl: { rejectUnauthorized: false },
  },
});


// Define Models
const Theme = sequelize.define('Theme', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: Sequelize.STRING
}, {
  timestamps: false // disable createdAt and updatedAt fields
});

const Set = sequelize.define('Set', {
  set_num: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  name: Sequelize.STRING,
  year: Sequelize.INTEGER,
  num_parts: Sequelize.INTEGER,
  theme_id: Sequelize.INTEGER,
  img_url: Sequelize.STRING
}, {
  timestamps: false
});

// Associations
Set.belongsTo(Theme, { foreignKey: 'theme_id' });

async function initialize() {
  try {
    const result = await sequelize.sync();
    console.log('Connected to the database successfully and synced models.');
  } catch (error) {
    console.error('Error connecting to the database:', error);
    throw error;
  }
}


async function getAllSets() {
  try {
    const sets = await Set.findAll({
      include: Theme
    });
    return sets;
  } catch (error) {
    throw error;
  }
}
async function getSetByNum(setNum) {
  try {
    const set = await Set.findOne({
      where: { set_num: setNum },
      include: Theme
    });
    if (!set) {
      throw new Error('Unable to find requested set');
    }
    return set;
  } catch (error) {
    throw error;
  }
}

async function getSetsByTheme(theme) {

  return new Promise((resolve, reject) => {
    let foundSets = sets.filter(s => s.theme.toUpperCase().includes(theme.toUpperCase()));

    if (foundSets.length > 0 ) {
      resolve(foundSets)
    } else {
      reject("Unable to find requested sets");
    }

  });

}

async function addSet(setData) {
  try {
    await Set.create(setData);
  } catch (error) {
    throw new Error(error.errors[0].message);
  }
}

async function editSet(set_num, setData) {
  try {
    await Set.update(setData, { where: { set_num: set_num } });
  } catch (error) {
    throw new Error(error.errors[0].message);
  }
}

async function deleteSet(set_num) {
  try {
    await Set.destroy({ where: { set_num: set_num } });
  } catch (error) {
    throw new Error(error.errors[0].message);
  }
}

async function getAllThemes() {
  try {
    const themes = await Theme.findAll();
    return themes;
  } catch (error) {
    throw error;
  }
}

module.exports = { initialize, getAllSets, getSetByNum, getSetsByTheme, addSet, editSet, deleteSet, getAllThemes };

initialize().catch(console.error);