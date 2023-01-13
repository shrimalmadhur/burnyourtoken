import Head from 'next/head'
import dynamic from "next/dynamic";
import styles from '../styles/Home.module.css'
import BurnPage from '../components/BurnPage'

import { FC } from 'react';

const Home: FC = () => {
  return (
    <>
      <Head>
        <title>Burn Your Token</title>
        <meta name="description" content="Burn your token" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/next.svg" />
      </Head>
      <main className={styles.main}>
        <BurnPage></BurnPage>
      </main>
    </>
  )
}

export default dynamic(() => Promise.resolve(Home), { ssr: false });
