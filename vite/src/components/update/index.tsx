import { ipcRenderer } from 'electron'
import type { ProgressInfo } from 'electron-updater'
import { useCallback, useEffect, useState } from 'react'
import Modal from '@/components/update/Modal'
import Progress from '@/components/update/Progress'
import styles from './update.module.scss'

const Update = () => {
  const [checking, setChecking] = useState(false)
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [versionInfo, setVersionInfo] = useState<VersionInfo>()
  const [updateError, setUpdateError] = useState<ErrorType>()
  const [progressInfo, setProgressInfo] = useState<Partial<ProgressInfo>>()
  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const [modalBtn, setModalBtn] = useState<{
    cancelText?: string
    okText?: string
    onCancel?: () => void
    onOk?: () => void
  }>({
    onCancel: () => setModalOpen(false),
    onOk: () => ipcRenderer.invoke('start-download'),
  })

  const checkUpdate = async () => {
    setChecking(true)
    /**
     * @type {import('electron-updater').UpdateCheckResult | null | { message: string, error: Error }}
     */
    const result = await ipcRenderer.invoke('check-update')
    setProgressInfo({ percent: 0 })
    setChecking(false)
    setModalOpen(true)
    if (result?.error) {
      setUpdateAvailable(false)
      setUpdateError(result?.error)
    }
  }

  const onUpdateCanAvailable = useCallback((_event: Electron.IpcRendererEvent, arg1: VersionInfo) => {
    setVersionInfo(arg1)
    setUpdateError(undefined)
    // Can be update
    if (arg1.update) {
      setModalBtn(state => ({
        ...state,
        cancelText: 'Cancel',
        okText: 'Update',
        onOk: () => ipcRenderer.invoke('start-download'),
      }))
      setUpdateAvailable(true)
    } else {
      setUpdateAvailable(false)
    }
  }, [])

  const onUpdateError = useCallback((_event: Electron.IpcRendererEvent, arg1: ErrorType) => {
    setUpdateAvailable(false)
    setUpdateError(arg1)
  }, [])

  const onDownloadProgress = useCallback((_event: Electron.IpcRendererEvent, arg1: ProgressInfo) => {
    setProgressInfo(arg1)
  }, [])

  const onUpdateDownloaded = useCallback((_event: Electron.IpcRendererEvent, ...args: any[]) => {
    setProgressInfo({ percent: 100 })
    setModalBtn(state => ({
      ...state,
      cancelText: 'Later',
      okText: 'Install now',
      onOk: () => ipcRenderer.invoke('quit-and-install'),
    }))
  }, [])

  useEffect(() => {
    // Get version information and whether to update
    ipcRenderer.on('update-can-available', onUpdateCanAvailable)
    ipcRenderer.on('update-error', onUpdateError)
    ipcRenderer.on('download-progress', onDownloadProgress)
    ipcRenderer.on('update-downloaded', onUpdateDownloaded)

    return () => {
      ipcRenderer.off('update-can-available', onUpdateCanAvailable)
      ipcRenderer.off('update-error', onUpdateError)
      ipcRenderer.off('download-progress', onDownloadProgress)
      ipcRenderer.off('update-downloaded', onUpdateDownloaded)
    }
  }, [])

  return (
    <>
      <Modal
        open={modalOpen}
        cancelText={modalBtn?.cancelText}
        okText={modalBtn?.okText}
        onCancel={modalBtn?.onCancel}
        onOk={modalBtn?.onOk}
        footer={updateAvailable ? /* hide footer */null : undefined}
      >
        <div className={styles.modalslot}>
          {updateError
            ? (
              <div className='update-error'>
                <p>Error downloading the latest version.</p>
                <p>{updateError.message}</p>
              </div>
            ) : updateAvailable
              ? (
                <div className='can-available'>
                  <div>The last version is: v{versionInfo?.newVersion}</div>
                  <div className='new-version-target'>v{versionInfo?.version} -&gt; v{versionInfo?.newVersion}</div>
                  <div className='update-progress'>
                    <div className='progress-title'>Update progress:</div>
                    <div className='progress-bar'>
                      <Progress percent={progressInfo?.percent} ></Progress>
                    </div>
                  </div>
                </div>
              )
              : (
                <div className='can-not-available'>{JSON.stringify(versionInfo ?? {}, null, 2)}</div>
              )}
        </div>
      </Modal>
      <button disabled={checking} onClick={checkUpdate}>
        {checking ? 'Checking...' : 'Check update'}
      </button>
    </>
  )
}

export default Update

/**
 * This is a React component that checks for updates for an Electron app using the 'electron-updater' package, 
 * and displays a modal window to prompt the user to download and install the update. 
 * 
 * The component uses the 'ipcRenderer' module to communicate with the main process of the Electron app. When 
 * the component mounts, it registers event listeners for the following events emitted by the main process: 
 * 'update-can-available', 'update-error', 'download-progress', and 'update-downloaded'. When an event is 
 * emitted, the corresponding callback function updates the component state accordingly. 
 * 
 * The 'checkUpdate' function is called when the user clicks on the "Check update" button. It sets the 'checking' 
 * state to 'true', sends a message to the main process to check for updates, and sets the 'modalOpen' state to true. 
 * If an error occurs during the update check, the 'updateError' state is set to the error object. Otherwise, if an 
 * update is available, the 'updateAvailable' state is set to 'true' and the modal window displays information about 
 * the new version, the update progress, and buttons to cancel or install the update. If no update is available, the 
 * modal window displays a message saying so.
 * 
 * The 'Modal' component is a custom component that displays a modal window with customizable footer buttons. The 
 * 'Progress' component is another custom component that displays a progress bar. The styles for the component are 
 * defined in a separate SCSS file.
 */