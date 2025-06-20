import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'w1hfz6z1',
    dataset: 'production',
    useCdn: false, // Set to true for production use to enable CDN caching
    token: 'skID2eDxvasp01LxvHN23LUEhBwUctYfLc8wxLDIfSuU6x3Wcgew2RkQh54QCJsFHDCgPrSPYa5KyKP2sPtdUyqL4KYpy9F69oryID0PLjdt0FEfPKeri0VUhhtwxhkSEDPusuX8h493Pe44jyzZBsrbMuyv9q6XnJ9NlyMD6LakrXZ4x4gr',
  },
  /**
   * Enable auto-updates for studios.
   * Learn more at https://www.sanity.io/docs/cli#auto-updates
   */
  autoUpdates: true,
})

