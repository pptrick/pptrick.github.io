import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import Layout from '../components/layout'
import styles from '../styles/publication.module.css'
import Divider from '@mui/material/Divider'
import {BsFillFileEarmarkTextFill} from 'react-icons/bs';
import PubCard from '../components/pubCard'


// get publication resource file
// note that publication dir should be arranged as:
// --publication
// ----[pub name]
// ------abstract.md
// ------img.png

export async function getStaticProps() {
    // get publication dirs under /publication
    const pubResPath = path.join(process.cwd(), 'public', 'resource', 'publication');
    const pubNames = fs.readdirSync(pubResPath);
    var pubData = pubNames.map(pubName => {
        // get filename
        const id = pubName;
        const abstract_path = path.join(pubResPath, pubName, 'abstract.md')
        // get all images
        const img_dir = path.join(pubResPath, pubName)
        const img_paths = fs.readdirSync(img_dir).filter(path => {
            return path.endsWith('.jpg') || path.endsWith('.png');
        });
        // get content and metadata
        const abstract = fs.readFileSync(abstract_path, 'utf8')
        const meta = matter(abstract)
        //combine data with id
        return {
            id,
            img_path: path.join('/resource', 'publication', id, img_paths[0]), //read the first image as frontpage
            ...meta.data,
            content: meta.content
        };
    })
    // sort by date
    pubData = pubData.sort(({ date: a }, { date: b }) => {
        if (a < b) {
          return 1
        } else if (a > b) {
          return -1
        } else {
          return 0
        }
    })
    // return as static props
    return {
        props: {
            pubData
        }
    }
}

export default function Publication({pubData}){
    return (
        <Layout>
            <Divider className={styles.divider}><BsFillFileEarmarkTextFill/> Publication</Divider>
            <ul className={styles.Container}>
                {pubData.map(({id, img_path, title, author, conference, date, content}) => (
                    <PubCard 
                        key={id} 
                        id={id}
                        img_path={img_path} 
                        title={title} 
                        author={author}
                        conference={conference}
                        date={date}
                        content={content}
                    ></PubCard>
                ))}
            </ul>
        </Layout>
    )
}