import Layout from '../components/layout'
import styles from '../styles/publication.module.css'
import Divider from '@mui/material/Divider'
import {BsFillBookFill} from 'react-icons/bs';

export default function Education(){
    return (
        <Layout>
            <Divider className={styles.divider}><BsFillBookFill/> Education</Divider>
            <div>Sorry, this page is not available yet. Coming soon!</div>
        </Layout>
    )
}