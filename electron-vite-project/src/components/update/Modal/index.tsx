import React, { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import styles from './modal.module.scss'

const ModalTemplate: React.FC<React.PropsWithChildren<{
  title?: ReactNode
  footer?: ReactNode
  cancelText?: string
  okText?: string
  onCancel?: () => void
  onOk?: () => void
  width?: number
}>> = props => {
  const {
    title,
    children,
    footer,
    cancelText = 'Cancel',
    okText = 'OK',
    onCancel,
    onOk,
    width = 530,
  } = props

  return (
    <div className={styles.modal}>
      <div className='modal-mask' />
      <div className='modal-warp'>
        <div className='modal-content' style={{ width }}>
          <div className='modal-header'>
            <div className='modal-header-text'>{title}</div>
            <span
              className='modal-close'
              onClick={onCancel}
            >
              <svg
                viewBox="0 0 1024 1024"
                version="1.1" xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M557.312 513.248l265.28-263.904c12.544-12.48 12.608-32.704 0.128-45.248-12.512-12.576-32.704-12.608-45.248-0.128l-265.344 263.936-263.04-263.84C236.64 191.584 216.384 191.52 203.84 204 191.328 216.48 191.296 236.736 203.776 249.28l262.976 263.776L201.6 776.8c-12.544 12.48-12.608 32.704-0.128 45.248 6.24 6.272 14.464 9.44 22.688 9.44 8.16 0 16.32-3.104 22.56-9.312l265.216-263.808 265.44 266.24c6.24 6.272 14.432 9.408 22.656 9.408 8.192 0 16.352-3.136 22.592-9.344 12.512-12.48 12.544-32.704 0.064-45.248L557.312 513.248z" p-id="2764" fill="currentColor">
                </path>
              </svg>
            </span>
          </div>
          <div className='modal-body'>{children}</div>
          {typeof footer !== 'undefined' ? (
            <div className='modal-footer'>
              <button onClick={onCancel}>{cancelText}</button>
              <button onClick={onOk}>{okText}</button>
            </div>
          ) : footer}
        </div>
      </div>
    </div>
  )
}

const Modal = (props: Parameters<typeof ModalTemplate>[0] & { open: boolean }) => {
  const { open, ...omit } = props

  return createPortal(
    open ? ModalTemplate(omit) : null,
    document.body,
  )
}

export default Modal

/**
 * This code defines a React component called 'Modal' that renders a modal dialog box with customizable title, body, 
 * and footer.
 * 
 * The 'Modal' component uses the 'createPortal' method from React-DOM to render the modal outside of the 
 * component tree, directly into the 'document.body' element. This ensures that the modal will always be displayed 
 * on top of other content, even if the component that renders it is nested deeply within the application's component 
 * hierarchy.
 * 
 * The 'Modal' component takes in props including 'title', 'children', 'footer', 'cancelText', 'okText', 'onCancel', 
 * 'onOk', and 'width', which are passed down to the 'ModalTemplate' component. The 'ModalTemplate' component renders 
 * the modal's title, body, and footer, and responds to the 'onCancel' and 'onOk' callbacks when the corresponding 
 * buttons are clicked.
 * 
 * The 'ModalTemplate' component uses CSS modules to style the modal's appearance. It defines a layout with a semi-
 * transparent overlay ('.modal-mask'), a centered container ('.modal-wrap'), and a content section ('.modal-content') 
 * that can be customized with the 'width' prop. The modal header, body, and footer are contained within the 
 * '.modal-content' element, and the header includes a close button that triggers the 'onCancel' callback when clicked.
 */