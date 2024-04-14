import pg from 'pg'
const { Client } = pg

const pgClientPostgres = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'postgres'
})

async function run() {
    try {
        await pgClientPostgres.connect()
        await pgClientPostgres.query('CREATE DATABASE CUSTOMER')

        const pgClientCustomers = new Client({
            host: 'localhost',
            port: 5111,
            user: 'postgres',
            password: 'postgres',
            database: 'customer'
        })

        await pgClientCustomers.connect()

        const sql = `CREATE TABLE CUSTOMERS(id serial not null, name text not null) partition by range(id)`

        await pgClientCustomers.query(sql)

        for (let i = 0; i < 10; i++) {
            const partitionFrom = i * 10
            const partitionTo = (i + 1) * 10
            const partitionName = `users_${partitionFrom}_${partitionTo}`
            const createPartitionQuery = `CREATE TABLE ${partitionName}(like customers including indexes)`;

            await pgClientCustomers.query(createPartitionQuery)

            const attachPartitionQuery = `alter table customers attach partition ${partitionName} for values from (${partitionFrom}) to (${partitionTo})`
            
            await pgClientCustomers.query(attachPartitionQuery)
        }
        await pgClientPostgres.end()
        await pgClientCustomers.end()

    } catch (error) {
        console.log('Error running the program: ', error)
    }

}

run();