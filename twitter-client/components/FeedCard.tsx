import React from 'react'
import Image from 'next/image'
import { FaRegComment, FaRetweet, FaRegHeart, FaRegChartBar, FaShareSquare } from 'react-icons/fa'

function FeedCard() {
  return (
    <div className='border border-l-0 border-r-0 border-b-0 border-gray-800 p-5 hover:bg-gray-950 transition-all cursor-pointer'>
      <div className='grid grid-cols-12 gap-3'>
        <div className='col-span-1'>
          <Image className='rounded-full' src="https://img.freepik.com/free-vector/user-circles-set_78370-4704.jpg?uid=R167043860&semt=ais_hybrid&w=740" alt='user-profile-img' width={50} height={50} />
        </div>
        <div className='col-span-11'>
          <div className='flex items-center'>
            <h5 className='font-bold mr-2'>John Doe</h5>
            <span className='text-gray-500'>@johndoe</span>
            <span className='text-gray-500 mx-1'>·</span>
            <span className='text-gray-500'>2h</span>
          </div>
          <div className='mt-2'>
            <p className='text-white'>Just finished building a Twitter clone with Next.js and Tailwind CSS. The developer experience is amazing! #webdev #nextjs #tailwindcss</p>
          </div>
          {/* Optional image attachment */}
          <div className='mt-3'>
            <Image 
              className='rounded-xl'
              src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop" 
              alt='tweet-image' 
              width={500} 
              height={300} 
              layout="responsive"
            />
          </div>
          <div className='flex justify-between mt-4 text-gray-500 w-full max-w-md'>
            <div className='flex items-center group'>
              <FaRegComment className='mr-2 group-hover:text-blue-500' />
              <span className='group-hover:text-blue-500'>24</span>
            </div>
            <div className='flex items-center group'>
              <FaRetweet className='mr-2 group-hover:text-green-500 text-2xl' />
              <span className='group-hover:text-green-500'>12</span>
            </div>
            <div className='flex items-center group'>
              <FaRegHeart className='mr-2 group-hover:text-pink-500' />
              <span className='group-hover:text-pink-500'>348</span>
            </div>
            <div className='flex items-center group'>
              <FaRegChartBar className='mr-2 group-hover:text-blue-500' />
              <span className='group-hover:text-blue-500'>2.4K</span>
            </div>
            <div className='flex items-center group'>
              <FaShareSquare className='group-hover:text-blue-500' />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FeedCard