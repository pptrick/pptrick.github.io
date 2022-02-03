import styles from '../styles/publication.module.css'
import {Grid, Item} from '@mui/material/'
import Zoom from 'react-medium-image-zoom'
import 'react-medium-image-zoom/dist/styles.css'

export default function PubCard({id, img_path, title, author, conference, date, content}){
    return (
        <ul className={styles.pubContainer}>
            <Grid container spacing={2}>
                <Grid item xs={3}>
                    <div className={styles.pubImg}>
                    <Zoom>
                        <img
                        src={img_path}
                        className={styles.pubImg}
                        alt={id}
                        />
                    </Zoom>
                    </div>
                </Grid>
                <Grid item xs={9}>
                    <div className={styles.pubTitle}>{title}</div>
                    <div className={styles.pubAuthor}>{author}</div>
                    <div className={styles.pubConf}>{conference}</div>
                    {/* <div>{content}</div> */}
                    <div>{date}</div>
                </Grid>
            </Grid>
        </ul>
    )
}