import React from 'react'
import styles from './progress.module.scss'

const Progress: React.FC<React.PropsWithChildren<{
  percent?: number
}>> = props => {
  const { percent = 0 } = props

  return (
    <div className={styles.progress}>
      <div className='progress-pr'>
        <div
          className='progress-rate'
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className='progress-num'>{(percent ?? 0).toString().substring(0,4)}%</span>
    </div>
  )
}

export default Progress

/**
 * This code defines a React functional component called 'Progress'. This component displays a progress bar with a 
 * percentage and a label. The component receives a 'percent' prop, which is used to determine the width of the 
 * progress bar and the displayed percentage.
 * 
 * The 'Progress' component renders a 'div' with a class name of 'progress', which contains another 'div' with a 
 * class name of 'progress-pr'. The inner 'div' represents the progress bar and has a 'div' child with a class name 
 * of 'progress-rate'. The width of the 'progress-rate' 'div' is determined by the 'percent' prop, which is passed 
 * to the 'style' attribute as a percentage value.
 * 
 * The component also displays the percentage value as text, which is derived from the 'percent' prop. The value 
 * is first converted to a string and then truncated to 4 characters. If the 'percent' prop is not provided, the 
 * component defaults to a value of 0.
 */