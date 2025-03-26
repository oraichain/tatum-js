export const splitAmountAndId = (
  asset: string,
):
  | {
      amount: string
      id: string
    }
  | undefined => {
  // case 1: asset has form 999ibc/1234567890
  if (asset.split('ibc').length === 2 && asset.split('ibc')[1] !== '') {
    return {
      amount: asset.split('ibc')[0],
      id: `ibc${asset.split('ibc')[1]}`,
    }
  }

  // case 2: asset has form 999factory/orai1abc/sub
  if (asset.split('factory').length === 2 && asset.split('factory')[1] !== '') {
    return {
      amount: asset.split('factory')[0],
      id: `factory${asset.split('factory')[1]}`,
    }
  }

  // case 3: asset has form 999orai
  if (asset.split('orai').length === 2 && asset.split('orai')[1] === '') {
    return {
      amount: asset.split('orai')[0],
      id: 'orai',
    }
  }

  // case 4: asset has form 9999orai1lus0f0rhx8s03gdllx2n6vhkmf0536dv57wfge
  if (asset.split('orai').length === 2 && asset.split('orai')[1] !== '') {
    return {
      amount: asset.split('orai')[0],
      id: `orai${asset.split('orai')[1]}`,
    }
  }

  return undefined
}
