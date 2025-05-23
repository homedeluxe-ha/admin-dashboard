import { useNavigate, useParams } from "react-router-dom";
import fetchApi from "../../../api/fetchApi";
import ProductForm from "../../components/ProductForm/ProductForm";
import "./UpdateProduct.css";
import { useEffect, useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import Loading from "../../components/Loading/Loading";

const currency = [{ id: "USD", name: "USD" }];

const schema = yup
  .object({
    name: yup.string().required("Name is required"),
    description: yup.string().required("Description is required"),
    price: yup.string().required("Price is required"),
    stock: yup.number().required("Stock is required"),
    category: yup.string().required("Category is required"),
    currency: yup.string().required("Currency is required"),
    featured: yup.boolean(),
    //TODO: Check image validation
    // image: yup.mixed().test("fileType", "Unsupported file format", (value) => {
    //   if (!value) return true;
    //   return ["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(
    //     value.type
    //   );
    // }),
  })
  .required();

function UpdateProduct() {
  const params = useParams();
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const getCategories = async () => {
    try {
      const response = await fetchApi({
        method: "GET",
        url: `/categories`,
      });
      if (response.categories) {
        setCategories(response.categories);
      }
    } catch (error) {
      setCategories(null);
    }
  };

  const getProduct = async () => {
    try {
      const response = await fetchApi({
        method: "GET",
        url: `/products/${params.id}`,
      });

      console.log(response);

      if (response.status === 404) {
        setError("Product not found");
        setProduct(null);
      } else if (response.product) {
        setProduct(response.product);
        setError(null);
      } else {
        setError("Something went wrong, please try again");
        setProduct(null);
      }
    } catch (error) {
      setProduct(null);
      setError("Something went wrong, please try again");
      toast.error("Something went wrong, please try again");
    }
  };

  useEffect(() => {
    getProduct();
    getCategories();
  }, [params.id]);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    getValues,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onSubmit",
    defaultValues: {},
  });

  useEffect(() => {
    if (product && categories) {
      reset({
        ...product,
        category: String(product.categoryId),
      });
      setValue("currency", product.currency);
    }
  }, [product, categories, reset, setValue]);

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();

      // Append each field to the FormData object
      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("category", data.category);
      formData.append("price", data.price);
      formData.append("stock", data.stock);
      formData.append("currency", data.currency);
      formData.append("featured", data.featured);

      if (data.image && data.image.length > 0) {
        Array.from(data.image).forEach((image) => {
          formData.append("image", image);
        });
      }

      const response = await fetchApi({
        method: "patch",
        url: `/products/${params.id}`,
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
        accessToken: user.accessToken,
      });

      if (response) {
        toast.success(
          "Product updated successfully, redirecting to Products view"
        );
        setTimeout(() => {
          navigate("/admin/products");
        }, 4000);
      }
    } catch (error) {
      toast.error("Something went wrong, please try again");
    }
  };

  return (
    <div className="updateProduct-container container-fluid">
      {error ? (
        <div className="error-message">
          <h3 className="alert alert-danger text-uppercase fs-6">{error}</h3>
        </div>
      ) : product ? (
        <>
          <div className="updateProduct-header fs-5 text-uppercase fw-semibold mb-3">
            Update product
          </div>
          <ProductForm
            register={register}
            errors={errors}
            currency={currency}
            categories={categories}
            onSubmit={onSubmit}
            handleSubmit={handleSubmit}
          />
        </>
      ) : (
        <Loading />
      )}
    </div>
  );
}

export default UpdateProduct;
