import pg from 'pg'
const { Client } = pg

async function run() {
    try {
        const pgClientCustomers = new Client({
            host: 'localhost',
            port: 5432,
            user: 'postgres',
            password: 'postgres',
            database: 'users'
        })

        await pgClientCustomers.connect()


        for (let i = 0; i < 10; i++) {
            const sql = `INSERT INTO USERS(name) select random() from  generate_series(1,5)`;

            await pgClientCustomers.query(sql)
        }

        await pgClientCustomers.end()

    } catch (error) {
        console.log('Error running the program: ', error)
    }

}

run();
