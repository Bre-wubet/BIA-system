// utils/fetchFilteredDataSources.js
import { getDataSourcesByModuleAndType } from "../api/integrationApi";

export async function fetchFilteredDataSources(formData, setDataSources, setLoading, setError) {
  try {
    setLoading(true);

    // pull nested fields safely
    const moduleName = formData?.module?.module_name || "";
    const dataSourceType = formData?.type || "";

    // early exit if nothing selected
    if (!moduleName && !dataSourceType) {
      setError("Please select a module or data source type to filter.");
      setLoading(false);
      return;
    }

    // call API
    const response = await getDataSourcesByModuleAndType(moduleName, dataSourceType);

    if (response?.success) {
      setDataSources(response.data);
    } else {
      setError(response?.message || "Failed to fetch filtered data sources.");
    }
  } catch (err) {
    console.error("Error fetching filtered data sources:", err);
    setError("Something went wrong while filtering data sources.");
  } finally {
    setLoading(false);
  }
}
