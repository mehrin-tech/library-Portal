import {Router} from 'express'

import {requireStdAuth} from '../Utils/stdMiddleware.js'
import {getCategoryList,getSubCategory, getBookDetails,startOnlineReading,stopOnlineReading} from '../Controllers/userCategoryController.js'

const router=Router()

router.get('/categoryList',requireStdAuth,getCategoryList)
router.get('/view/:id',requireStdAuth,getSubCategory)
router.get('/:catId/book/:subId',requireStdAuth,getBookDetails)
export default router