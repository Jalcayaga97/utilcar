import { HomePageRootInput } from './schemas/presentation/components/HomePageRootInput.jsx'

export const formComponents = {
  input: (props) => {
    if (props.id === 'root' && props.schemaType.name === 'homePage') {
      return <HomePageRootInput {...props} />
    }
    return props.renderDefault(props)
  },
}
